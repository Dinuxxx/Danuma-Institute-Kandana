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
                    'time_tables.start_time',
                    'time_tables.end_time'
                )
                ->leftJoin('course_attendances', 'attendances.att_id', '=', 'course_attendances.att_id')
                ->leftJoin('courses', 'course_attendances.course_id', '=', 'courses.course_id')
                ->leftJoin('time_tables', 'course_attendances.for_slot', '=', 'time_tables.ttable_id')
                ->where('attendances.student_id', $student->student_id);
            
            // Apply filters
            if ($request->has('date') && $request->date) {
                $query->whereDate('attendances.date', $request->date);
            }
            
            if ($request->has('course_id') && $request->course_id) {
                $query->where('courses.course_id', $request->course_id);
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
            
            // This month's attendance stats
            $thisMonthStart = Carbon::now()->startOfMonth()->toDateString();
            $thisMonthEnd = Carbon::now()->endOfMonth()->toDateString();
            
            $monthlyAttendances = DB::table('course_attendances')
                ->join('attendances', 'course_attendances.att_id', '=', 'attendances.att_id')
                ->where('attendances.student_id', $student->student_id)
                ->whereBetween('attendances.date', [$thisMonthStart, $thisMonthEnd])
                ->select('course_attendances.status')
                ->get();
            
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
            return response()->json([
                'message' => 'Error fetching attendance statistics',
                'error' => $e->getMessage() 
            ], 500);
        }
    }
}