<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Attendance;
use App\Models\CourseAttendance;
use App\Models\Course;
use App\Models\TimeTables;
use App\Models\Exams;
use App\Models\ExamMarks;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TeacherDashboardController extends Controller
{
    /**
     * Display the teacher dashboard.
     */
    public function index()
    {
        return inertia('Teacher/Dashboard', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Get total students for the teacher's courses.
     */
    public function getTotalStudents()
    {
        $teacher = Teacher::where('user_id', Auth::id())->first();
        
        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }
        
        // Get counts of students in teacher's courses (distinct students)
        $totalStudents = Course::where('teacher_id', $teacher->tea_id)
            ->withCount(['students' => function($query) {
                $query->where('student_courses.status', 'active');
            }])
            ->get()
            ->sum('students_count');
            
        // Get growth by comparing to last month's count
        $lastMonthStudents = Course::where('teacher_id', $teacher->tea_id)
            ->withCount(['students' => function($query) {
                $query->where('student_courses.status', 'active')
                    ->where('student_courses.registered_date_time', '<', Carbon::now()->subMonth());
            }])
            ->get()
            ->sum('students_count');
            
        $growth = 0;
        if ($lastMonthStudents > 0) {
            $growth = (($totalStudents - $lastMonthStudents) / $lastMonthStudents) * 100;
        }
        
        return response()->json([
            'value' => $totalStudents,
            'growth' => round($growth, 1)
        ]);
    }

    /**
     * Get attendance statistics for the teacher's courses.
     */
    public function getAttendanceStats()
    {
        $teacher = Teacher::where('user_id', Auth::id())->first();
        
        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }
        
        // Get total students in teacher's courses
        $coursesIds = Course::where('teacher_id', $teacher->tea_id)->pluck('course_id');
        
        if ($coursesIds->isEmpty()) {
            return response()->json([
                'value' => '0%',
                'growth' => 0
            ]);
        }
        
        // Get today's attendance rate
        $today = Carbon::today()->toDateString();
        
        $attendanceStats = $this->calculateAttendanceRate($coursesIds, $today);
        $previousAttendanceStats = $this->calculateAttendanceRate($coursesIds, Carbon::today()->subWeek()->toDateString());
        
        $growth = 0;
        if ($previousAttendanceStats > 0) {
            $growth = (($attendanceStats - $previousAttendanceStats) / $previousAttendanceStats) * 100;
        }
        
        return response()->json([
            'value' => round($attendanceStats) . '%',
            'growth' => round($growth, 1)
        ]);
    }
    
    /**
     * Helper method to calculate attendance rate for given courses on a specific date
     */
    private function calculateAttendanceRate($coursesIds, $date)
    {
        // Get all time slots for these courses on this date
        $dayOfWeek = Carbon::parse($date)->format('l');
        
        $timeSlots = TimeTables::whereIn('course_id', $coursesIds)
            ->where('day_of_week', $dayOfWeek)
            ->pluck('ttable_id');
            
        if ($timeSlots->isEmpty()) {
            return 0;
        }
        
        // Get course attendances for these slots
        $totalAttendances = CourseAttendance::whereIn('for_slot', $timeSlots)
            ->whereHas('attendance', function($query) use ($date) {
                $query->where('date', $date);
            })
            ->count();
            
        $presentAttendances = CourseAttendance::whereIn('for_slot', $timeSlots)
            ->whereHas('attendance', function($query) use ($date) {
                $query->where('date', $date);
            })
            ->where('status', 'present')
            ->count();
            
        if ($totalAttendances == 0) {
            return 0;
        }
        
        return ($presentAttendances / $totalAttendances) * 100;
    }

    /**
     * Get grade statistics for the teacher's courses based on actual exam data.
     */
    public function getGradeStats()
    {
        $teacher = Teacher::where('user_id', Auth::id())->first();
        
        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }
        
        // Get all courses taught by this teacher
        $courseIds = Course::where('teacher_id', $teacher->tea_id)->pluck('course_id');
        
        if ($courseIds->isEmpty()) {
            return response()->json([
                'value' => '0%',
                'growth' => 0
            ]);
        }
        
        // Get all exam marks for the teacher's courses
        $currentMonthMarks = ExamMarks::whereHas('exam', function($query) use ($courseIds) {
            $query->whereIn('course_id', $courseIds)
                ->whereMonth('exam_date', Carbon::now()->month)
                ->whereYear('exam_date', Carbon::now()->year);
        })->pluck('marks');
        
        // Get previous month's marks for comparison
        $previousMonthMarks = ExamMarks::whereHas('exam', function($query) use ($courseIds) {
            $query->whereIn('course_id', $courseIds)
                ->whereMonth('exam_date', Carbon::now()->subMonth()->month)
                ->whereYear('exam_date', Carbon::now()->subMonth()->year);
        })->pluck('marks');
        
        // Calculate current average
        $currentAverage = $currentMonthMarks->isEmpty() ? 0 : $currentMonthMarks->avg();
        
        // Calculate previous average
        $previousAverage = $previousMonthMarks->isEmpty() ? 0 : $previousMonthMarks->avg();
        
        // If no current month data, fall back to all-time average
        if ($currentMonthMarks->isEmpty()) {
            $allTimeMarks = ExamMarks::whereHas('exam', function($query) use ($courseIds) {
                $query->whereIn('course_id', $courseIds);
            })->pluck('marks');
            
            $currentAverage = $allTimeMarks->isEmpty() ? 0 : $allTimeMarks->avg();
        }
        
        // Calculate growth
        $growth = 0;
        if ($previousAverage > 0) {
            $growth = (($currentAverage - $previousAverage) / $previousAverage) * 100;
        }
        
        return response()->json([
            'value' => round($currentAverage) . '%',
            'growth' => round($growth, 1)
        ]);
    }

    /**
     * Get assignment statistics for the teacher's courses.
     * This is a placeholder until you implement assignments functionality
     */
    public function getAssignmentStats()
    {
        // Placeholder response
        return response()->json([
            'value' => '18/25',
            'growth' => 5.4
        ]);
    }

    /**
     * Get class attendance overview for the last 6 months.
     */
    public function getClassAttendance()
    {
        $teacher = Teacher::where('user_id', Auth::id())->first();
        
        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }
        
        $coursesIds = Course::where('teacher_id', $teacher->tea_id)->pluck('course_id');
        
        if ($coursesIds->isEmpty()) {
            return response()->json([]);
        }
        
        $attendanceData = [];
        
        // Get data for the last 6 months
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $monthName = $monthDate->format('M');
            $month = $monthDate->month;
            $year = $monthDate->year;
            
            // Calculate attendance percentage for this month
            $attendancePercentage = DB::table('course_attendances')
                ->join('attendances', 'course_attendances.att_id', '=', 'attendances.att_id')
                ->join('time_tables', 'course_attendances.for_slot', '=', 'time_tables.ttable_id')
                ->whereIn('time_tables.course_id', $coursesIds)
                ->whereMonth('attendances.date', $month)
                ->whereYear('attendances.date', $year)
                ->selectRaw('SUM(CASE WHEN course_attendances.status = "present" THEN 1 ELSE 0 END) as present_count')
                ->selectRaw('COUNT(*) as total_count')
                ->first();
                
            $percentage = 0;
            if ($attendancePercentage && $attendancePercentage->total_count > 0) {
                $percentage = ($attendancePercentage->present_count / $attendancePercentage->total_count) * 100;
            }
            
            $attendanceData[] = [
                'month' => $monthName,
                'attendance' => round($percentage)
            ];
        }
        
        return response()->json($attendanceData);
    }

    /**
     * Get today's schedule for the teacher.
     */
    public function getTodaySchedule()
    {
        $teacher = Teacher::where('user_id', Auth::id())->first();
        
        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }
        
        $today = Carbon::now()->format('l'); // Get day name (Monday, Tuesday, etc.)
        
        $schedule = TimeTables::whereHas('course', function($query) use ($teacher) {
                $query->where('teacher_id', $teacher->tea_id);
            })
            ->where('day_of_week', $today)
            ->with(['course' => function($query) {
                $query->select('course_id', 'course_name', 'grade');
            }])
            ->orderBy('start_time')
            ->get()
            ->map(function($timeSlot) {
                return [
                    'time' => Carbon::parse($timeSlot->start_time)->format('H:i') . ' - ' . Carbon::parse($timeSlot->end_time)->format('H:i'),
                    'class' => $timeSlot->course->course_name,
                    'room' => 'Room ' . $timeSlot->classroom_no,
                    'grade' => 'Grade ' . $timeSlot->course->grade,
                ];
            });
            
        return response()->json($schedule);
    }
    
    /**
     * Get class performance data based on actual exam results.
     */
    public function getClassPerformance()
    {
        $teacher = Teacher::where('user_id', Auth::id())->first();
        
        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }
        
        // Get the teacher's courses with their exam performance
        $courses = Course::where('teacher_id', $teacher->tea_id)
            ->with(['exams.marks'])
            ->select('course_id', 'course_name', 'grade')
            ->get();
            
        // Calculate performance data for each course
        $performanceData = $courses->map(function($course) {
            // Get all exam marks for this course
            $allMarks = collect();
            
            foreach ($course->exams as $exam) {
                foreach ($exam->marks as $mark) {
                    $allMarks->push($mark->marks);
                }
            }
            
            // Calculate average grade for this course
            $averageGrade = $allMarks->isEmpty() ? 0 : $allMarks->avg();
            
            return [
                'class' => 'Grade ' . $course->grade,
                'averageGrade' => round($averageGrade, 1)
            ];
        })->filter(function($course) {
            // Only include courses that have exam data
            return $course['averageGrade'] > 0;
        });
        
        // If no real data available, return empty array instead of placeholder
        if ($performanceData->isEmpty()) {
            return response()->json([]);
        }
        
        return response()->json($performanceData->values());
    }

    /**
     * Helper method to calculate grade based on marks
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
}