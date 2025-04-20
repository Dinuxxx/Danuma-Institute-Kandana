<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CourseAttendance;
use App\Models\Student;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class StudentAttendanceController extends Controller
{
    /**
     * Display the student's attendance page
     */
    public function index()
    {
        return Inertia::render('Student/Attendance');
    }

    /**
     * Get attendance report for the authenticated student
     */
    public function getAttendanceReport(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
            'course_id' => 'nullable|exists:courses,course_id',
            'page' => 'nullable|integer|min:1',
            'perPage' => 'nullable|integer|min:1|max:100',
        ]);

        try {
            // Get the authenticated user's student record
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json([
                    'message' => 'Student record not found'
                ], 404);
            }
            
            // Start with a base query for this student only
            $query = Attendance::with([
                'student', 
                'student.user', 
                'student.user.registration', 
                'courseAttendances', 
                'courseAttendances.course'
            ])->where('student_id', $student->student_id);
            
            // Apply filters
            if ($request->has('date') && $request->date) {
                $query->whereDate('date', $request->date);
            }
            
            if ($request->has('course_id') && $request->course_id) {
                $query->whereHas('courseAttendances', function($q) use ($request) {
                    $q->where('course_id', $request->course_id);
                });
            }
            
            // Get pagination parameters from request or use defaults
            $perPage = $request->input('perPage', 10);
            $page = $request->input('page', 1);
            
            $attendances = $query->orderBy('date', 'desc')->paginate($perPage, ['*'], 'page', $page);
            
            return response()->json([
                'data' => $attendances->items(),
                'total' => $attendances->total(),
                'current_page' => $attendances->currentPage(),
                'per_page' => $attendances->perPage(),
                'last_page' => $attendances->lastPage()
            ]);
        } catch (\Exception $e) {
            // Log the error for server-side debugging
            \Log::error('Student attendance report error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Error fetching attendance data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student's enrolled courses
     */
    public function getStudentCourses()
    {
        try {
            // Get the authenticated user's student record
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json([
                    'message' => 'Student record not found'
                ], 404);
            }
            
            // Get student's courses
            $courses = DB::table('student_courses')
                ->join('courses', 'student_courses.course_id', '=', 'courses.course_id')
                ->where('student_courses.student_id', $student->student_id)
                ->select('courses.course_id', 'courses.course_name', 'courses.subject')
                ->get();
            
            return response()->json($courses);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching courses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance statistics for the student
     */
    public function getAttendanceStats()
    {
        try {
            // Get the authenticated user's student record
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json([
                    'message' => 'Student record not found'
                ], 404);
            }
            
            // Today's attendance count
            $today = Carbon::today()->toDateString();
            $todayAttendance = Attendance::where('student_id', $student->student_id)
                ->whereDate('date', $today)
                ->with('courseAttendances')
                ->first();
            
            // This month's attendance stats
            $thisMonthStart = Carbon::now()->startOfMonth()->toDateString();
            $thisMonthEnd = Carbon::now()->endOfMonth()->toDateString();
            
            $monthlyAttendances = CourseAttendance::join('attendances', 'course_attendances.att_id', '=', 'attendances.att_id')
                ->where('attendances.student_id', $student->student_id)
                ->whereBetween('attendances.date', [$thisMonthStart, $thisMonthEnd])
                ->get();
            
            // Calculate statistics
            $present = $monthlyAttendances->where('status', 'present')->count();
            $absent = $monthlyAttendances->where('status', 'absent')->count();
            $late = $monthlyAttendances->where('status', 'late')->count();
            $excused = $monthlyAttendances->where('status', 'excused')->count();
            $total = $monthlyAttendances->count();
            
            return response()->json([
                'today_status' => $todayAttendance && $todayAttendance->courseAttendances->isNotEmpty() 
                    ? $todayAttendance->courseAttendances[0]->status 
                    : 'Not marked',
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'excused' => $excused,
                'total' => $total,
                'attendance_rate' => $total > 0 ? round(($present / $total) * 100, 2) : 0
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching attendance statistics',
                'error' => $e->getMessage() 
            ], 500);
        }
    }
}