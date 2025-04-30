<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Course;
use App\Models\Payment;
use App\Models\StudentCourse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get count of all teachers
     *
     * @return \Illuminate\Http\Response
     */
    public function getTeachersCount()
    {
        $count = Teacher::count();
        return response()->json(['count' => $count]);
    }

    /**
     * Get count of all students
     *
     * @return \Illuminate\Http\Response
     */
    public function getStudentsCount()
    {
        $count = Student::count();
        return response()->json(['count' => $count]);
    }

    /**
     * Get total revenue
     *
     * @return \Illuminate\Http\Response
     */
    public function getTotalRevenue()
  {
      $total = Payment::where('status', 'Completed')->sum('amount');
      return response()->json(['total' => $total]);
  }

    /**
     * Get monthly student registrations for the past 12 months
     *
     * @return \Illuminate\Http\Response
     */
    public function getMonthlyRegistrations()
    {
        $startDate = Carbon::now()->subMonths(11)->startOfMonth();
        
        $monthlyRegistrations = DB::table('user_registrations')
            ->join('students', 'user_registrations.user_id', '=', 'students.user_id')
            ->select(
                DB::raw('YEAR(user_registrations.created_at) as year'),
                DB::raw('MONTH(user_registrations.created_at) as month'),
                DB::raw('MONTHNAME(user_registrations.created_at) as month_name'),
                DB::raw('COUNT(*) as registrations')
            )
            ->where('user_registrations.created_at', '>=', $startDate)
            ->whereNotNull('role_id') // Ensure only completed registrations
            ->groupBy('year', 'month', 'month_name')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Ensure we have data for all 12 months
        $result = [];
        $currentDate = $startDate->copy();
        $endDate = Carbon::now();

        while ($currentDate <= $endDate) {
            $monthName = $currentDate->format('M');
            $year = $currentDate->year;
            $month = $currentDate->month;
            
            // Find if we have data for this month
            $monthData = $monthlyRegistrations->first(function($item) use ($year, $month) {
                return $item->year == $year && $item->month == $month;
            });
            
            $result[] = [
                'month' => $monthName,
                'registrations' => $monthData ? $monthData->registrations : 0
            ];
            
            $currentDate->addMonth();
        }

        return response()->json($result);
    }

    /**
     * Get monthly payment data for the past 12 months
     *
     * @return \Illuminate\Http\Response
     */
    public function getMonthlyPayments()
    {
    $startDate = Carbon::now()->subMonths(11)->startOfMonth();
    
    $monthlyPayments = DB::table('payments')
        ->select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('MONTHNAME(created_at) as month_name'),
            DB::raw('SUM(amount) as amount')
        )
        ->where('status', 'Completed')  // Changed from 'verified' to 'Completed'
        ->where('created_at', '>=', $startDate)
        ->groupBy('year', 'month', 'month_name')
        ->orderBy('year')
        ->orderBy('month')
        ->get();

        // Ensure we have data for all 12 months
        $result = [];
        $currentDate = $startDate->copy();
        $endDate = Carbon::now();

        while ($currentDate <= $endDate) {
            $monthName = $currentDate->format('M');
            $year = $currentDate->year;
            $month = $currentDate->month;
            
            // Find if we have data for this month
            $monthData = $monthlyPayments->first(function($item) use ($year, $month) {
                return $item->year == $year && $item->month == $month;
            });
            
            $result[] = [
                'month' => $monthName,
                'amount' => $monthData ? $monthData->amount : 0
            ];
            
            $currentDate->addMonth();
        }

        return response()->json($result);
    }

    /**
     * Get revenue and expenses by month for the past 12 months
     *
     * @return \Illuminate\Http\Response
     */
    public function getRevenueByMonth()
    {
        $startDate = Carbon::now()->subMonths(11)->startOfMonth();
        
        $monthlyRevenue = DB::table('payments')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('MONTHNAME(created_at) as month_name'),
                DB::raw('SUM(amount) as revenue')
            )
            ->where('status', 'verified')
            ->where('created_at', '>=', $startDate)
            ->groupBy('year', 'month', 'month_name')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Calculate expenses as 50% of revenue (example calculation - adjust as needed)
        $result = [];
        $currentDate = $startDate->copy();
        $endDate = Carbon::now();

        while ($currentDate <= $endDate) {
            $monthName = $currentDate->format('M');
            $year = $currentDate->year;
            $month = $currentDate->month;
            
            // Find if we have data for this month
            $monthData = $monthlyRevenue->first(function($item) use ($year, $month) {
                return $item->year == $year && $item->month == $month;
            });
            
            $revenue = $monthData ? $monthData->revenue : 0;
            $expenses = $revenue * 0.5; // Sample calculation - replace with actual expense calculation
            
            $result[] = [
                'month' => $monthName,
                'revenue' => $revenue,
                'expenses' => $expenses
            ];
            
            $currentDate->addMonth();
        }

        return response()->json($result);
    }

    /**
     * Get course distribution data
     *
     * @return \Illuminate\Http\Response
     */
    public function getCourseDistribution()
    {
        $courses = DB::table('courses')
            ->select(
                'courses.course_name as name',
                DB::raw('COUNT(student_courses.student_id) as students')
            )
            ->leftJoin('student_courses', 'courses.course_id', '=', 'student_courses.course_id')
            ->where('student_courses.status', 'active')
            ->groupBy('courses.course_name')
            ->orderBy('students', 'desc')
            ->limit(5)
            ->get();

        return response()->json($courses);
    }
}