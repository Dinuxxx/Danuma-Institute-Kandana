<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CourseAttendance;
use App\Models\StudentCourse;
use App\Models\TimeTables;
use App\Models\Student;
use App\Models\Payment;
use App\Models\Course;
use App\Models\ExamMarks;
use App\Models\Exams;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentDashboardController extends Controller
{
    /**
     * Display the student dashboard
     */
    public function index()
    {
        return Inertia::render('Student/Dashboard');
    }

    /**
     * Get monthly attendance data for the student
     */
    public function getMonthlyAttendance()
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }
        
        // Get attendance data for the last 6 months
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subMonths(6);
        
        $attendanceData = DB::table('attendances')
            ->join('course_attendances', 'attendances.att_id', '=', 'course_attendances.att_id')
            ->select(
                DB::raw('MONTH(attendances.date) as month'),
                DB::raw('YEAR(attendances.date) as year'),
                DB::raw('CONCAT(MONTHNAME(attendances.date), " ", YEAR(attendances.date)) as month_name'),
                DB::raw('ROUND(AVG(CASE WHEN course_attendances.status = "present" OR course_attendances.status = "late" THEN 100 ELSE 0 END), 1) as attendance_rate')
            )
            ->where('attendances.student_id', $student->student_id)
            ->whereBetween('attendances.date', [$startDate, $endDate])
            ->groupBy('year', 'month', 'month_name')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
            
        // Format the data for the chart
        $formattedData = $attendanceData->map(function ($item) {
            return [
                'month' => $item->month_name,
                'attendance' => $item->attendance_rate
            ];
        });
        
        return response()->json($formattedData);
    }

    /**
     * Get attendance statistics for the student
     */
    public function getAttendanceStats()
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }
        
        // Calculate attendance rate for the current month
        $currentMonth = Carbon::now()->startOfMonth();
        $currentMonthEnd = Carbon::now()->endOfMonth();
        
        // Get the current month's attendance rate
        $currentMonthAttendance = DB::table('attendances')
            ->join('course_attendances', 'attendances.att_id', '=', 'course_attendances.att_id')
            ->where('attendances.student_id', $student->student_id)
            ->whereBetween('attendances.date', [$currentMonth, $currentMonthEnd])
            ->select(
                DB::raw('ROUND(AVG(CASE WHEN course_attendances.status = "present" OR course_attendances.status = "late" THEN 100 ELSE 0 END), 1) as attendance_rate')
            )
            ->first();
            
        // Get the previous month's attendance rate for comparison
        $previousMonth = Carbon::now()->subMonth()->startOfMonth();
        $previousMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        
        $previousMonthAttendance = DB::table('attendances')
            ->join('course_attendances', 'attendances.att_id', '=', 'course_attendances.att_id')
            ->where('attendances.student_id', $student->student_id)
            ->whereBetween('attendances.date', [$previousMonth, $previousMonthEnd])
            ->select(
                DB::raw('ROUND(AVG(CASE WHEN course_attendances.status = "present" OR course_attendances.status = "late" THEN 100 ELSE 0 END), 1) as attendance_rate')
            )
            ->first();
            
        // Calculate the growth percentage
        $currentRate = $currentMonthAttendance ? $currentMonthAttendance->attendance_rate : 0;
        $previousRate = $previousMonthAttendance ? $previousMonthAttendance->attendance_rate : 0;
        
        $growth = 0;
        if ($previousRate > 0) {
            $growth = round((($currentRate - $previousRate) / $previousRate) * 100, 1);
        }
        
        return response()->json([
            'value' => $currentRate . '%',
            'growth' => $growth
        ]);
    }
    
    /**
     * Get due amount statistics for the student
     */
    public function getDueAmountStats()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->first();
        
        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }
        
        // Calculate current month's due amount
        $currentDueAmount = $this->calculateDueAmount($student->student_id);
        
        // Calculate previous month's due amount for comparison
        $previousDueAmount = $this->calculateDueAmountForMonth($student->student_id, Carbon::now()->subMonth());
        
        // Calculate growth percentage (negative growth is good for due amounts)
        $growth = 0;
        if ($previousDueAmount > 0) {
            $growth = round((($currentDueAmount - $previousDueAmount) / $previousDueAmount) * 100, 1);
        }
        
        return response()->json([
            'value' => 'Rs. ' . number_format($currentDueAmount, 0),
            'growth' => $growth
        ]);
    }
    
    /**
     * Get student performance data (grades by subject/course)
     */
    public function getStudentPerformance()
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }
        
        try {
            // Get student's exam marks with course information
            $examMarks = ExamMarks::where('student_id', $student->student_id)
                ->with(['exam.course'])
                ->get();
            
            // Group by course and calculate average marks
            $performanceData = $examMarks->groupBy('exam.course.course_name')
                ->map(function ($marks, $courseName) {
                    $averageMarks = $marks->avg('marks');
                    return [
                        'subject' => $courseName,
                        'grade' => round($averageMarks, 1)
                    ];
                })
                ->values();
            
            // If no exam data exists, get enrolled courses with placeholder data
            if ($performanceData->isEmpty()) {
                $enrolledCourses = StudentCourse::where('student_id', $student->student_id)
                    ->where('status', 'active')
                    ->with('course')
                    ->get();
                    
                $performanceData = $enrolledCourses->map(function ($enrollment) {
                    return [
                        'subject' => $enrollment->course->course_name,
                        'grade' => 0 // No exam data yet
                    ];
                });
            }
            
            return response()->json($performanceData);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching student performance: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch performance data'], 500);
        }
    }
    
    /**
     * Calculate grade based on marks (same logic as in StudentExamController)
     */
    private function calculateGrade($marks)
    {
        if ($marks >= 85) return 'A+';
        if ($marks >= 75) return 'A';
        if ($marks >= 60) return 'B';
        if ($marks >= 50) return 'C';
        if ($marks >= 35) return 'S';
        return 'W';
    }
    
    /**
     * Calculate total due amount for a student for current month
     */
    private function calculateDueAmount($studentId)
    {
        // Get all active courses for the student
        $studentCourses = StudentCourse::where('student_id', $studentId)
            ->where('status', 'active')
            ->get();
        
        // Calculate total monthly fees
        $totalMonthlyFees = 0;
        foreach ($studentCourses as $registration) {
            $course = Course::where('course_id', $registration->course_id)->first();
            if ($course) {
                $totalMonthlyFees += $course->monthly_fees;
            }
        }
        
        // Get total paid amount for the current month
        $paidAmount = Payment::where('student_id', $studentId)
            ->where('status', 'Completed')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('amount');
        
        // Calculate due amount
        $dueAmount = $totalMonthlyFees - $paidAmount;
        
        return max(0, $dueAmount); // Ensure due amount is not negative
    }
    
    /**
     * Calculate total due amount for a student for a specific month
     */
    private function calculateDueAmountForMonth($studentId, $month)
    {
        // Get all active courses for the student
        $studentCourses = StudentCourse::where('student_id', $studentId)
            ->where('status', 'active')
            ->get();
        
        // Calculate total monthly fees
        $totalMonthlyFees = 0;
        foreach ($studentCourses as $registration) {
            $course = Course::where('course_id', $registration->course_id)->first();
            if ($course) {
                $totalMonthlyFees += $course->monthly_fees;
            }
        }
        
        // Get total paid amount for the specified month
        $paidAmount = Payment::where('student_id', $studentId)
            ->where('status', 'Completed')
            ->whereMonth('created_at', $month->month)
            ->whereYear('created_at', $month->year)
            ->sum('amount');
        
        // Calculate due amount
        $dueAmount = $totalMonthlyFees - $paidAmount;
        
        return max(0, $dueAmount); // Ensure due amount is not negative
    }
    
    /**
     * Get average grade stats with growth calculation
     */
    public function getGradeStats()
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }
        
        try {
            // Get current month's exam marks
            $currentMonthMarks = ExamMarks::where('student_id', $student->student_id)
                ->whereHas('exam', function($query) {
                    $query->whereMonth('exam_date', Carbon::now()->month)
                          ->whereYear('exam_date', Carbon::now()->year);
                })
                ->avg('marks');
            
            // Get previous month's exam marks
            $previousMonthMarks = ExamMarks::where('student_id', $student->student_id)
                ->whereHas('exam', function($query) {
                    $query->whereMonth('exam_date', Carbon::now()->subMonth()->month)
                          ->whereYear('exam_date', Carbon::now()->subMonth()->year);
                })
                ->avg('marks');
            
            // Calculate overall average if no current month data
            if (!$currentMonthMarks) {
                $currentMonthMarks = ExamMarks::where('student_id', $student->student_id)
                    ->avg('marks') ?? 0;
            }
            
            // Calculate growth
            $growth = 0;
            if ($previousMonthMarks && $previousMonthMarks > 0) {
                $growth = round((($currentMonthMarks - $previousMonthMarks) / $previousMonthMarks) * 100, 1);
            }
            
            return response()->json([
                'value' => round($currentMonthMarks, 1) . '%',
                'growth' => $growth
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error calculating grade stats: ' . $e->getMessage());
            return response()->json([
                'value' => '0%',
                'growth' => 0
            ]);
        }
    }
}