<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CourseAttendance;
use App\Models\Student;
use App\Models\Course;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class TeacherAttendanceController extends Controller
{
    /**
     * Display the teacher's attendance view page
     */
    public function index()
    {
        return Inertia::render('Teacher/Attendance');
    }

    /**
     * Get attendance report for students in teacher's courses
     */
    public function getAttendanceReport(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
            'course_id' => 'nullable|exists:courses,course_id',
            'student_id' => 'nullable|exists:students,student_id',
            'page' => 'nullable|integer|min:1',
            'perPage' => 'nullable|integer|min:1|max:100',
        ]);

        try {
            // Get the authenticated user's teacher record
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->first();
            
            if (!$teacher) {
                return response()->json([
                    'message' => 'Teacher record not found',
                    'data' => [],
                    'total' => 0,
                    'current_page' => $request->input('page', 1),
                    'per_page' => $request->input('perPage', 10),
                    'last_page' => 1
                ]);
            }
            
            // Get the teacher's courses
            $teacherCourses = Course::where('teacher_id', $teacher->tea_id)
                ->pluck('course_id')
                ->toArray();
            
            if (empty($teacherCourses)) {
                return response()->json([
                    'message' => 'No courses found for this teacher',
                    'data' => [],
                    'total' => 0,
                    'current_page' => $request->input('page', 1),
                    'per_page' => $request->input('perPage', 10),
                    'last_page' => 1
                ]);
            }
            
            // Create a query to join the necessary tables directly
            $query = DB::table('attendances')
                ->select(
                    'attendances.att_id',
                    'attendances.date',
                    'attendances.check_in_time',
                    'attendances.check_out_time',
                    'course_attendances.status',
                    'courses.course_id',
                    'courses.course_name',
                    'students.student_id',
                    'users.name as student_name',
                    'time_tables.start_time',
                    'time_tables.end_time'
                )
                ->leftJoin('course_attendances', 'attendances.att_id', '=', 'course_attendances.att_id')
                ->leftJoin('courses', 'course_attendances.course_id', '=', 'courses.course_id')
                ->leftJoin('students', 'attendances.student_id', '=', 'students.student_id')
                ->leftJoin('users', 'students.user_id', '=', 'users.id')
                ->leftJoin('time_tables', 'course_attendances.for_slot', '=', 'time_tables.ttable_id')
                ->whereIn('courses.course_id', $teacherCourses);
            
            // Apply filters
            if ($request->has('date') && $request->date) {
                $query->whereDate('attendances.date', $request->date);
            }
            
            if ($request->has('course_id') && $request->course_id) {
                $query->where('courses.course_id', $request->course_id);
            }

            if ($request->has('student_id') && $request->student_id) {
                $query->where('students.student_id', $request->student_id);
            }
            
            // Sort by date descending
            $query->orderBy('attendances.date', 'desc');
            
            // Get pagination parameters from request or use defaults
            $perPage = $request->input('perPage', 10);
            $page = $request->input('page', 1);
            
            // Paginate the results
            $total = $query->count();
            $attendances = $query->forPage($page, $perPage)->get();
            
            // Format the results
            $formattedAttendances = $attendances->map(function($item) {
                return [
                    'att_id' => $item->att_id,
                    'date' => $item->date,
                    'check_in_time' => $item->check_in_time,
                    'check_out_time' => $item->check_out_time,
                    'student' => [
                        'student_id' => $item->student_id,
                        'name' => $item->student_name
                    ],
                    'courseAttendances' => [
                        [
                            'status' => $item->status ?? 'Not Marked',
                            'course' => $item->course_id ? [
                                'course_id' => $item->course_id,
                                'course_name' => $item->course_name
                            ] : null
                        ]
                    ]
                ];
            });
            
            return response()->json([
                'data' => $formattedAttendances,
                'total' => $total,
                'current_page' => $page,
                'per_page' => $perPage,
                'last_page' => ceil($total / $perPage)
            ]);
            
        } catch (\Exception $e) {
            // Log the error for server-side debugging
            \Log::error('Teacher attendance report error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Error fetching attendance data',
                'error' => $e->getMessage(),
                'data' => [],
                'total' => 0,
                'current_page' => $request->input('page', 1),
                'per_page' => $request->input('perPage', 10),
                'last_page' => 1
            ], 500);
        }
    }

    /**
     * Get teacher's courses
     */
    public function getTeacherCourses()
    {
        try {
            // Get the authenticated user's teacher record
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $teacher = Teacher::where('user_id', $user->id)->first();
            
            if (!$teacher) {
                return response()->json([]);
            }
            
            // Get teacher's courses
            $courses = Course::where('teacher_id', $teacher->tea_id)
                ->select('course_id', 'course_name', 'subject')
                ->get();
            
            return response()->json($courses);
        } catch (\Exception $e) {
            \Log::error('Error in getTeacherCourses: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([], 200); // Return empty array instead of error
        }
    }

    /**
     * Get students in teacher's courses for filtering
     */
    public function getStudentsInCourses(Request $request)
    {
        try {
            // Get the authenticated user's teacher record
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([]);
            }
            
            $teacher = Teacher::where('user_id', $user->id)->first();
            
            if (!$teacher) {
                return response()->json([]);
            }
            
            $query = DB::table('student_courses')
                ->join('courses', 'student_courses.course_id', '=', 'courses.course_id')
                ->join('students', 'student_courses.student_id', '=', 'students.student_id')
                ->join('users', 'students.user_id', '=', 'users.id')
                ->where('courses.teacher_id', $teacher->tea_id)
                ->select('students.student_id', 'users.name');
                
            // Filter by course if provided
            if ($request->has('course_id') && $request->course_id) {
                $query->where('courses.course_id', $request->course_id);
            }
            
            return response()->json($query->distinct()->get());
        } catch (\Exception $e) {
            \Log::error('Error in getStudentsInCourses: ' . $e->getMessage());
            return response()->json([], 200); // Return empty array instead of error
        }
    }

    /**
     * Get attendance statistics for a course
     */
    public function getAttendanceStats(Request $request)
    {
        $request->validate([
            'course_id' => 'nullable|exists:courses,course_id',
            'student_id' => 'nullable|exists:students,student_id',
        ]);

        try {
            // Get the authenticated user's teacher record
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'present' => 0,
                    'absent' => 0,
                    'late' => 0,
                    'total' => 0,
                    'attendance_rate' => 0
                ]);
            }
            
            $teacher = Teacher::where('user_id', $user->id)->first();
            
            if (!$teacher) {
                return response()->json([
                    'present' => 0,
                    'absent' => 0,
                    'late' => 0,
                    'total' => 0,
                    'attendance_rate' => 0
                ]);
            }
            
            // This month's attendance stats
            $thisMonthStart = Carbon::now()->startOfMonth()->toDateString();
            $thisMonthEnd = Carbon::now()->endOfMonth()->toDateString();
            
            $query = DB::table('course_attendances')
                ->join('attendances', 'course_attendances.att_id', '=', 'attendances.att_id')
                ->join('courses', 'course_attendances.course_id', '=', 'courses.course_id')
                ->where('courses.teacher_id', $teacher->tea_id)
                ->whereBetween('attendances.date', [$thisMonthStart, $thisMonthEnd]);
            
            // Add filters
            if ($request->has('course_id') && $request->course_id) {
                $query->where('course_attendances.course_id', $request->course_id);
            }
            
            if ($request->has('student_id') && $request->student_id) {
                $query->where('attendances.student_id', $request->student_id);
            }
            
            $monthlyAttendances = $query->select('course_attendances.status')->get();
            
            // Calculate statistics
            $present = $monthlyAttendances->where('status', 'present')->count();
            $absent = $monthlyAttendances->where('status', 'absent')->count();
            $late = $monthlyAttendances->where('status', 'late')->count();
            $total = $monthlyAttendances->count();
            
            return response()->json([
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'total' => $total,
                'attendance_rate' => $total > 0 ? round((($present + $late) / $total) * 100, 2) : 0
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getAttendanceStats: ' . $e->getMessage());
            return response()->json([
                'present' => 0,
                'absent' => 0,
                'late' => 0,
                'total' => 0,
                'attendance_rate' => 0
            ], 200);
        }
    }

    /**
     * Get monthly attendance statistics
     */
    public function getMonthlyStats(Request $request)
    {
        $request->validate([
            'course_id' => 'nullable|exists:courses,course_id',
            'student_id' => 'nullable|exists:students,student_id',
        ]);

        // Prepare default weekly data structure (5 weeks max per month)
        $weeklyData = [
            ['name' => 'Week 1', 'present' => 0, 'absent' => 0, 'late' => 0],
            ['name' => 'Week 2', 'present' => 0, 'absent' => 0, 'late' => 0],
            ['name' => 'Week 3', 'present' => 0, 'absent' => 0, 'late' => 0],
            ['name' => 'Week 4', 'present' => 0, 'absent' => 0, 'late' => 0],
            ['name' => 'Week 5', 'present' => 0, 'absent' => 0, 'late' => 0]
        ];

        try {
            // Get the authenticated user's teacher record
            $user = Auth::user();
            
            if (!$user) {
                return response()->json($weeklyData);
            }
            
            $teacher = Teacher::where('user_id', $user->id)->first();
            
            if (!$teacher) {
                return response()->json($weeklyData);
            }
            
            // Get the current month start and end dates
            $thisMonthStart = Carbon::now()->startOfMonth();
            $thisMonthEnd = Carbon::now()->endOfMonth();
            
            // Query base to get attendance records
            $query = DB::table('course_attendances')
                ->join('attendances', 'course_attendances.att_id', '=', 'attendances.att_id')
                ->join('courses', 'course_attendances.course_id', '=', 'courses.course_id')
                ->where('courses.teacher_id', $teacher->tea_id)
                ->whereBetween('attendances.date', [$thisMonthStart->toDateString(), $thisMonthEnd->toDateString()]);
            
            // Apply filters
            if ($request->has('course_id') && $request->course_id) {
                $query->where('course_attendances.course_id', $request->course_id);
            }
            
            if ($request->has('student_id') && $request->student_id) {
                $query->where('attendances.student_id', $request->student_id);
            }
            
            // Get attendance records for this month
            $attendanceRecords = $query->select(
                'attendances.date',
                'course_attendances.status'
            )->get();
            
            // Group attendances by week and status
            foreach ($attendanceRecords as $record) {
                $date = Carbon::parse($record->date);
                $weekNumber = ceil($date->day / 7); // Simple week calculation
                
                if ($weekNumber > 0 && $weekNumber <= 5) {
                    $weekIndex = $weekNumber - 1;
                    
                    if ($record->status === 'present') {
                        $weeklyData[$weekIndex]['present']++;
                    } elseif ($record->status === 'absent') {
                        $weeklyData[$weekIndex]['absent']++;
                    } elseif ($record->status === 'late') {
                        $weeklyData[$weekIndex]['late']++;
                    }
                }
            }
            
            return response()->json($weeklyData);
        } catch (\Exception $e) {
            \Log::error('Error in getMonthlyStats: ' . $e->getMessage());
            return response()->json($weeklyData, 200); // Return default data instead of error
        }
    }
}