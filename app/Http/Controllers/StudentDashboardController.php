<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CourseAttendance;
use App\Models\StudentCourse;
use App\Models\TimeTables;
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
     * Get completed assignments count
     */
    public function getAssignmentStats()
    {
        // This is a placeholder for future implementation
        // For now, we'll return mock data similar to the dashboard's original stats
        
        return response()->json([
            'value' => '24/30',
            'growth' => -3.1
        ]);
    }
    
    /**
     * Get average grade
     */
    public function getGradeStats()
    {
        // This is a placeholder for future implementation
        // For now, we'll return mock data similar to the dashboard's original stats
        
        return response()->json([
            'value' => '87%',
            'growth' => 5.2
        ]);
    }
}