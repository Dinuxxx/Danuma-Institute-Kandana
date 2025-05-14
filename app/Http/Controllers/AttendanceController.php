<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CourseAttendance;
use App\Models\Student;
use App\Models\Course;
use App\Models\TimeTables; // Make sure to include this
use App\Models\UserRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Display the attendance management page
     */
    public function index()
    {
        return Inertia::render('Admin/Attendance');
    }

    /**
     * Display the manual attendance page
     */
    public function manualAttendance()
    {
        return Inertia::render('Admin/ManualAttendance');
    }

    /**
     * Get student data by ID for manual attendance
     */
    public function getStudentData($id)
    {
        // Search by registration_id in user_registrations table
        $userRegistration = \App\Models\UserRegistration::where('registration_id', $id)->first();
        
        if (!$userRegistration) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }
        
        // Find student by user_id
        $student = Student::where('user_id', $userRegistration->user_id)
                    ->with(['user.registration'])
                    ->first();
        
        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        // Current day of week
        $dayOfWeek = Carbon::now()->format('l');
        $currentTime = Carbon::now()->format('H:i:s');
        
        // Get student's courses with scheduled classes for today
        $courses = DB::table('student_courses')
            ->join('courses', 'student_courses.course_id', '=', 'courses.course_id')
            ->join('time_tables', 'courses.course_id', '=', 'time_tables.course_id')
            ->where('student_courses.student_id', $student->student_id)
            ->where('time_tables.day_of_week', $dayOfWeek)
            ->where('time_tables.end_time', '>=', $currentTime) // Only show classes that haven't ended
            ->select('courses.course_id', 'courses.course_name', 
                    'time_tables.start_time', 'time_tables.end_time', 'time_tables.ttable_id')
            ->get();

        // Format student data
        $userData = $student->user->registration;
        $studentData = [
            'student_id' => $student->student_id,
            'grade' => $student->grade,
            'first_name' => $userData->first_name,
            'last_name' => $userData->last_name,
            'image' => $userData->image,
        ];

        return response()->json([
            'student' => $studentData,
            'courses' => $courses,
            'hasSchedule' => count($courses) > 0
        ]);
    }

    /**
     * Find appropriate time slot for the course on current day
     */
    private function findTimeSlot($courseId)
  {
      $dayOfWeek = Carbon::now()->format('l'); // e.g. Monday, Tuesday, etc.
      $currentTime = Carbon::now()->format('H:i:s');
      
      // First try to find a time slot where the current time falls between start and end time
      $timeSlot = TimeTables::where('course_id', $courseId)
          ->where('day_of_week', $dayOfWeek)
          ->where('start_time', '<=', $currentTime)
          ->where('end_time', '>=', $currentTime)
          ->first();
          
      // If no match found, get the closest time slot for today
      if (!$timeSlot) {
          $timeSlot = TimeTables::where('course_id', $courseId)
              ->where('day_of_week', $dayOfWeek)
              ->orderBy('start_time')
              ->first();
              
          // If still no match, get any time slot for this course regardless of day
          if (!$timeSlot) {
              $timeSlot = TimeTables::where('course_id', $courseId)
                  ->orderBy('day_of_week')
                  ->orderBy('start_time')
                  ->first();
          }
      }
      
      return $timeSlot ? $timeSlot->ttable_id : null;
  }

    /**
 * Check in a student
 */
public function checkIn(Request $request)
{
    $request->validate([
        'student_id' => 'required|exists:students,student_id',
        'course_id' => 'required|exists:courses,course_id',
        'check_in_time' => 'required',
        'ttable_id' => 'required|exists:time_tables,ttable_id',
    ]);

    DB::beginTransaction();
    try {
        // Parse the time string properly
        $timeString = $request->check_in_time;
        $today = Carbon::today();
        
        // Create a Carbon instance for today with the specified time
        $checkInTime = Carbon::createFromFormat('H:i', $timeString)
            ->setDate($today->year, $today->month, $today->day);
        
        // Get the time table entry to determine status
        $timeTable = TimeTables::find($request->ttable_id);
        
        if (!$timeTable) {
            return response()->json([
                'message' => 'Invalid time table reference'
            ], 400);
        }
        
        // Verify that this class is scheduled for today
        $dayOfWeek = Carbon::now()->format('l');
        if ($timeTable->day_of_week !== $dayOfWeek) {
            return response()->json([
                'error' => 'This class is not scheduled for today'
            ], 400);
        }
        
        // Calculate the attendance status based on check-in time
        $status = 'present';
        $startTime = Carbon::createFromFormat('H:i:s', $timeTable->start_time)
            ->setDate($today->year, $today->month, $today->day);
        $endTime = Carbon::createFromFormat('H:i:s', $timeTable->end_time)
            ->setDate($today->year, $today->month, $today->day);
        
        // Mark as late if check-in time is more than 1 hour after start time
        $oneHourLate = (clone $startTime)->addHour();
        if ($checkInTime->gt($oneHourLate) && $checkInTime->lt($endTime)) {
            $status = 'late';
        }
        
        // Check if attendance record for this student, course and day already exists
        $existingAttendance = Attendance::where('student_id', $request->student_id)
            ->whereDate('date', $today)
            ->whereHas('courseAttendances', function($query) use ($request) {
                $query->where('course_id', $request->course_id);
            })
            ->first();

        if ($existingAttendance) {
            // Update existing attendance record
            $existingAttendance->check_in_time = $checkInTime;
            $existingAttendance->marked_by = Auth::id();
            $existingAttendance->save();
            
            // Check if course attendance exists
            $courseAttendance = CourseAttendance::where('att_id', $existingAttendance->att_id)
                ->where('course_id', $request->course_id)
                ->first();
            
            if (!$courseAttendance) {
                // Create course attendance record
                CourseAttendance::create([
                    'att_id' => $existingAttendance->att_id,
                    'course_id' => $request->course_id,
                    'status' => $status,
                    'for_slot' => $request->ttable_id
                ]);
            } else {
                // Update status if needed
                $courseAttendance->status = $status;
                $courseAttendance->save();
            }
            
            $attendanceId = $existingAttendance->att_id;
            $formattedTime = $checkInTime->format('H:i'); // Format for frontend
        } else {
            // Create new attendance record
            $attendance = Attendance::create([
                'check_in_time' => $checkInTime,
                'date' => $today,
                'marked_method' => 'manual',
                'marked_by' => Auth::id(),
                'student_id' => $request->student_id
            ]);
            
            // Create course attendance record
            CourseAttendance::create([
                'att_id' => $attendance->att_id,
                'course_id' => $request->course_id,
                'status' => $status,
                'for_slot' => $request->ttable_id
            ]);
            
            $attendanceId = $attendance->att_id;
            $formattedTime = $checkInTime->format('H:i'); // Format for frontend
        }
        
        DB::commit();
        
        return response()->json([
            'message' => 'Student checked in successfully',
            'attendance_id' => $attendanceId,
            'status' => $status,
            'check_in_time' => $formattedTime
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to check in student',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
 * Check out a student
 */
public function checkOut(Request $request)
{
    $request->validate([
        'student_id' => 'required|exists:students,student_id',
        'course_id' => 'required|exists:courses,course_id',
        'check_out_time' => 'required',
    ]);

    DB::beginTransaction();
    try {
        // Find appropriate time slot
        $timeSlotId = $this->findTimeSlot($request->course_id);
        
        // Convert time string to full timestamp for today
        $timeString = $request->check_out_time;
        $today = Carbon::today();
        $checkOutTime = Carbon::createFromFormat('H:i', $timeString)
            ->setDate($today->year, $today->month, $today->day);
        
        // Find attendance record for today for this specific course
        $attendance = Attendance::where('student_id', $request->student_id)
            ->whereDate('date', $today)
            ->whereHas('courseAttendances', function($query) use ($request) {
                $query->where('course_id', $request->course_id);
            })
            ->first();

        if (!$attendance) {
            return response()->json([
                'message' => 'No check-in record found for this course today'
            ], 404);
        }

        // Update checkout time
        $attendance->check_out_time = $checkOutTime;
        $attendance->save();
        
        // Ensure course attendance exists
        $courseAttendance = CourseAttendance::where('att_id', $attendance->att_id)
            ->where('course_id', $request->course_id)
            ->first();
        
        if (!$courseAttendance) {
            // Create course attendance record if it doesn't exist
            CourseAttendance::create([
                'att_id' => $attendance->att_id,
                'course_id' => $request->course_id,
                'status' => 'present',
                'for_slot' => $timeSlotId
            ]);
        }
        
        DB::commit();
        
        // Format the time for the frontend
        $formattedTime = $checkOutTime->format('H:i');
        
        return response()->json([
            'message' => 'Student checked out successfully',
            'attendance_id' => $attendance->att_id,
            'check_out_time' => $formattedTime
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to check out student',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
 * Mark absent students for a specific day
 * This should be run by a scheduled task at the end of each day
 */
public function markAbsentStudents($date = null)
{
    // If no date provided, use today (or can use yesterday depending on when this is scheduled)
    if (!$date) {
        $date = Carbon::today()->toDateString();
    }
    
    // Get day of week for the specified date
    $dayOfWeek = Carbon::parse($date)->format('l');
    
    DB::beginTransaction();
    try {
        // Find all time tables for the specified day
        $timeTables = TimeTables::where('day_of_week', $dayOfWeek)->get();
        
        foreach ($timeTables as $timeTable) {
            // Get all students registered for this course
            $students = DB::table('student_courses')
                ->where('course_id', $timeTable->course_id)
                ->where('status', 'active')
                ->pluck('student_id');
                
            foreach ($students as $studentId) {
                // Check if attendance record already exists for this specific course and time slot
                $attendanceExists = Attendance::where('student_id', $studentId)
                    ->whereDate('date', $date)
                    ->whereHas('courseAttendances', function($query) use ($timeTable) {
                        $query->where('course_id', $timeTable->course_id)
                              ->where('for_slot', $timeTable->ttable_id);
                    })
                    ->exists();
                    
                // If no attendance record, create an 'absent' record
                if (!$attendanceExists) {
                    // Create attendance record
                    $attendance = Attendance::create([
                        'check_in_time' => null,
                        'check_out_time' => null,
                        'date' => $date,
                        'marked_method' => 'auto',
                        'marked_by' => null, // System generated
                        'student_id' => $studentId
                    ]);
                    
                    // Create course attendance record with 'absent' status
                    CourseAttendance::create([
                        'att_id' => $attendance->att_id,
                        'course_id' => $timeTable->course_id,
                        'status' => 'absent',
                        'for_slot' => $timeTable->ttable_id
                    ]);
                    
                    \Log::info("Marked student ID {$studentId} absent for course {$timeTable->course_id} on {$date}");
                }
            }
        }
        
        DB::commit();
        return true;
    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Error marking absent students: ' . $e->getMessage());
        \Log::error($e->getTraceAsString());
        return false;
    }
}

    /**
 * Get attendance report for students
 */
public function getAttendanceReport(Request $request)
{
    $request->validate([
        'date' => 'nullable|date',
        'course_id' => 'nullable|exists:courses,course_id',
        'student_id' => 'nullable|exists:students,student_id',
        'grade' => 'nullable|string',
        'page' => 'nullable|integer|min:1',
        'perPage' => 'nullable|integer|min:1|max:100',
    ]);

    try {
        // Start with a base query
        $query = Attendance::with([
            'student', 
            'student.user', 
            'student.user.registration', 
            'courseAttendances.course', // Make sure the course relationship is loaded
            'courseAttendances.timeSlot' // Load the time slot relationship
        ]);
        
        // Apply filters
        if ($request->has('date') && $request->date) {
            $query->whereDate('date', $request->date);
        }
        
        if ($request->has('student_id') && $request->student_id) {
            $query->where('student_id', $request->student_id);
        }
        
        if ($request->has('course_id') && $request->course_id) {
            $query->whereHas('courseAttendances', function($q) use ($request) {
                $q->where('course_id', $request->course_id);
            });
        }
        
        if ($request->has('grade') && $request->grade) {
            $query->whereHas('student', function($q) use ($request) {
                $q->where('grade', $request->grade);
            });
        }
        
        // Get pagination parameters from request or use defaults
        $perPage = $request->input('perPage', 10);
        $page = $request->input('page', 1);
        
        $attendances = $query->orderBy('date', 'desc')->paginate($perPage, ['*'], 'page', $page);
        
        // Format the response data to ensure course information is properly included
        $formattedItems = collect($attendances->items())->map(function($attendance) {
            // Extract course information if available
            $courseInfo = null;
            if ($attendance->courseAttendances->isNotEmpty()) {
                $courseAttendance = $attendance->courseAttendances->first();
                if ($courseAttendance->course) {
                    $courseInfo = [
                        'course_id' => $courseAttendance->course->course_id,
                        'course_name' => $courseAttendance->course->course_name,
                        'status' => $courseAttendance->status,
                        'time_slot' => $courseAttendance->timeSlot ? 
                            $courseAttendance->timeSlot->start_time . ' - ' . $courseAttendance->timeSlot->end_time : 
                            null
                    ];
                }
            }
            
            // Add course info to the attendance data
            $attendance->formatted_course_info = $courseInfo;
            return $attendance;
        });
        
        return response()->json([
            'data' => $formattedItems,
            'total' => $attendances->total(),
            'current_page' => $attendances->currentPage(),
            'per_page' => $attendances->perPage(),
            'last_page' => $attendances->lastPage()
        ]);
    } catch (\Exception $e) {
        // Log the error for server-side debugging
        \Log::error('Attendance report error: ' . $e->getMessage());
        \Log::error($e->getTraceAsString());
        
        return response()->json([
            'message' => 'Error fetching attendance data',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Get attendance statistics
     */
    public function getAttendanceStats()
    {
        // Today's attendance count
        $today = Carbon::today()->toDateString();
        $todayCount = Attendance::whereDate('date', $today)->count();
        
        // Yesterday's attendance count
        $yesterday = Carbon::yesterday()->toDateString();
        $yesterdayCount = Attendance::whereDate('date', $yesterday)->count();
        
        // This week's attendance count
        $thisWeekStart = Carbon::now()->startOfWeek()->toDateString();
        $thisWeekEnd = Carbon::now()->endOfWeek()->toDateString();
        $thisWeekCount = Attendance::whereBetween('date', [$thisWeekStart, $thisWeekEnd])->count();
        
        // Total students
        $totalStudents = Student::count();
        
        return response()->json([
            'today' => $todayCount,
            'yesterday' => $yesterdayCount,
            'this_week' => $thisWeekCount,
            'total_students' => $totalStudents,
            'attendance_rate' => $totalStudents > 0 ? round(($todayCount / $totalStudents) * 100, 2) : 0
        ]);
    }

    /**
     * Get QR code attendance page
     */
    public function qrAttendance()
    {
        return Inertia::render('Admin/QRAttendance');
    }

    /**
 * Mark attendance using QR code
 */
public function markQRAttendance(Request $request)
{
    $request->validate([
        'qr_id' => 'required|exists:q_r_codes,QR_id',
    ]);

    DB::beginTransaction();
    try {
        // Find student by QR code
        $student = Student::where('QR_id', $request->qr_id)->first();
        
        if (!$student) {
            return response()->json([
                'message' => 'Student not found for this QR code'
            ], 404);
        }
        
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();
        $dayOfWeek = $now->format('l');
        
        // Find current or upcoming class for this student
        $currentClass = DB::table('student_courses')
            ->join('courses', 'student_courses.course_id', '=', 'courses.course_id')
            ->join('time_tables', 'courses.course_id', '=', 'time_tables.course_id')
            ->where('student_courses.student_id', $student->student_id)
            ->where('time_tables.day_of_week', $dayOfWeek)
            ->where('time_tables.end_time', '>=', $now->format('H:i:s'))
            ->orderBy('time_tables.start_time')
            ->select(
                'courses.course_id', 
                'time_tables.ttable_id',
                'time_tables.start_time',
                'time_tables.end_time'
            )
            ->first();
        
        // Check if student already has an attendance record for today
        $existingAttendance = Attendance::where('student_id', $student->student_id)
            ->whereDate('date', $today)
            ->first();
            
        if ($existingAttendance) {
            // If no check-out time, update it (student is checking out)
            if (!$existingAttendance->check_out_time) {
                $existingAttendance->check_out_time = $now;
                $existingAttendance->save();
                
                DB::commit();
                return response()->json([
                    'message' => 'Student checked out successfully',
                    'student' => $student,
                    'action' => 'check_out',
                    'time' => $now->format('H:i')
                ]);
            } else {
                // Already checked in and out
                return response()->json([
                    'message' => 'Student already checked in and out for today',
                    'student' => $student
                ]);
            }
        } else if ($currentClass) {
            // Create new attendance record (student is checking in)
            $attendance = Attendance::create([
                'check_in_time' => $now,
                'date' => $today,
                'marked_method' => 'qr',
                'marked_by' => Auth::id(),
                'student_id' => $student->student_id
            ]);
            
            // Determine attendance status
            $status = 'present';
            $startTime = Carbon::createFromFormat('H:i:s', $currentClass->start_time);
            $oneHourLate = (clone $startTime)->addHour();
            
            // If check-in is more than 1 hour after start time, mark as late
            if ($now->format('H:i:s') > $oneHourLate->format('H:i:s')) {
                $status = 'late';
            }
            
            // Create course attendance record
            CourseAttendance::create([
                'att_id' => $attendance->att_id,
                'course_id' => $currentClass->course_id,
                'status' => $status,
                'for_slot' => $currentClass->ttable_id
            ]);
            
            DB::commit();
            return response()->json([
                'message' => 'Student checked in successfully' . ($status === 'late' ? ' (marked as late)' : ''),
                'student' => $student,
                'action' => 'check_in',
                'status' => $status,
                'time' => $now->format('H:i')
            ]);
        } else {
            // No current classes for today
            return response()->json([
                'message' => 'No classes scheduled for today or all classes have ended',
                'student' => $student,
                'action' => 'no_class'
            ]);
        }
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to mark attendance',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
 * Update an attendance record
 */
public function updateAttendance(Request $request, $attendanceId)
{
    $request->validate([
        'check_in_time' => 'nullable|date',
        'check_out_time' => 'nullable|date',
        'status' => 'required|string|in:Present,Absent,Late,Excused', // Validate status values
        'course_id' => 'nullable|exists:courses,course_id',
    ]);

    DB::beginTransaction();
    try {
        // Find the attendance record
        $attendance = Attendance::findOrFail($attendanceId);
        
        // Update attendance record
        if ($request->has('check_in_time')) {
            $attendance->check_in_time = $request->check_in_time;
        }
        
        if ($request->has('check_out_time')) {
            $attendance->check_out_time = $request->check_out_time;
        }
        
        // Make sure we record who made the edit
        $attendance->marked_by = Auth::id();
        
        $attendance->save();
        
        // Update course attendance status if course_id is provided
        if ($request->has('course_id') && $request->course_id) {
            $courseAttendance = CourseAttendance::where('att_id', $attendanceId)
                ->where('course_id', $request->course_id)
                ->first();
            
            if ($courseAttendance) {
                $courseAttendance->status = strtolower($request->status); // Ensure lowercase for consistency
                $courseAttendance->save();
            } else {
                // Create a new course attendance record if it doesn't exist
                // Find an appropriate time slot for this course
                $timeSlotId = $this->findTimeSlot($request->course_id);
                
                CourseAttendance::create([
                    'att_id' => $attendanceId,
                    'course_id' => $request->course_id,
                    'status' => strtolower($request->status),
                    'for_slot' => $timeSlotId
                ]);
            }
        }
        
        DB::commit();
        
        // Return updated record for frontend
        $updatedAttendance = Attendance::with([
            'student', 
            'student.user', 
            'student.user.registration', 
            'courseAttendances.course',
            'courseAttendances.timeSlot'
        ])->findOrFail($attendanceId);
        
        return response()->json([
            'message' => 'Attendance record updated successfully',
            'data' => $updatedAttendance
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Error updating attendance: ' . $e->getMessage());
        \Log::error($e->getTraceAsString());
        
        return response()->json([
            'message' => 'Failed to update attendance record',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Delete an attendance record
     */
    public function deleteAttendance($attendanceId)
    {
        try {
            // This will cascade delete related course_attendances due to foreign key constraint
            $attendance = Attendance::findOrFail($attendanceId);
            $attendance->delete();
            
            return response()->json([
                'message' => 'Attendance record deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete attendance record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance summary data for the specified date
     */
    public function getAttendanceSummary(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
        ]);

        // Use the specified date or default to today
        $date = $request->date ?? Carbon::today()->toDateString();
        
        try {
            // Get courses with scheduled classes for the specified date
            $dayOfWeek = Carbon::parse($date)->format('l');
            
            $courseSummaries = DB::table('courses')
                ->join('time_tables', 'courses.course_id', '=', 'time_tables.course_id')
                ->join('teachers', 'courses.teacher_id', '=', 'teachers.tea_id')
                ->join('users', 'teachers.user_id', '=', 'users.id')
                ->join('user_registrations', 'users.id', '=', 'user_registrations.user_id')
                ->where('time_tables.day_of_week', $dayOfWeek)
                ->select(
                    'courses.course_id',
                    'courses.course_name',
                    'courses.grade',
                    DB::raw("CONCAT(user_registrations.first_name, ' ', user_registrations.last_name) as teacher_name"),
                    DB::raw("CONCAT(time_tables.start_time, ' - ', time_tables.end_time) as schedule_time"),
                    'time_tables.ttable_id'
                )
                ->get();
            
            // For each course, calculate attendance percentages
            $summaries = [];
            foreach ($courseSummaries as $course) {
                // Count registered students for this course
                $totalStudents = DB::table('student_courses')
                    ->where('course_id', $course->course_id)
                    ->where('status', 'active')
                    ->count();
                
                if ($totalStudents > 0) {
                    // Count present students for this course on the specified date
                    $presentStudents = DB::table('attendances')
                        ->join('course_attendances', 'attendances.att_id', '=', 'course_attendances.att_id')
                        ->where('course_attendances.course_id', $course->course_id)
                        ->where('course_attendances.for_slot', $course->ttable_id)
                        ->whereDate('attendances.date', $date)
                        ->whereIn('course_attendances.status', ['present', 'late'])
                        ->count();
                    
                    // Count absent students for this course on the specified date
                    $absentStudents = DB::table('attendances')
                        ->join('course_attendances', 'attendances.att_id', '=', 'course_attendances.att_id')
                        ->where('course_attendances.course_id', $course->course_id)
                        ->where('course_attendances.for_slot', $course->ttable_id)
                        ->whereDate('attendances.date', $date)
                        ->where('course_attendances.status', 'absent')
                        ->count();
                    
                    // Calculate percentages
                    $presentPercentage = min(100, round(($presentStudents / $totalStudents) * 100));
                    $absentPercentage = min(100, round(($absentStudents / $totalStudents) * 100));
                    
                    // Add to summaries array
                    $summaries[] = [
                        'course' => $course->course_name,
                        'grade' => $course->grade,
                        'teacher' => $course->teacher_name,
                        'time' => $course->schedule_time,
                        'present' => $presentPercentage,
                        'absent' => $absentPercentage,
                        'total_students' => $totalStudents,
                        'course_id' => $course->course_id,
                        'ttable_id' => $course->ttable_id
                    ];
                }
            }
            
            return response()->json([
                'date' => $date,
                'formatted_date' => Carbon::parse($date)->format('Y/m/d'),
                'summaries' => $summaries
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching attendance summary: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch attendance summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function processPayment(Request $request)
    {
        // Validate request
        $request->validate([
            'student_id' => 'required|exists:students,student_id',
            'amount' => 'required|numeric|min:0',
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,course_id',
            'method' => 'required|string'
        ]);
        
        // Use the PaymentController's processManualPayment method
        $paymentController = app()->make(PaymentController::class);
        return $paymentController->processManualPayment($request);
    }
}