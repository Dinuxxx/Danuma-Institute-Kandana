<?php

namespace App\Http\Controllers;

use App\Models\Notice;
use App\Models\StudentCourse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentNoticeController extends Controller
{
    /**
     * Display notices relevant to the student (from admin to students or from teachers of student's courses).
     */
    /**
     * Display notices relevant to the student (from admin to students, from teachers of student's courses, or grade-specific).
     */
    public function index(Request $request)
    {
        // Get student ID and grade from auth user
        $student = Auth::user()->student ?? null;
        $studentId = $student ? $student->student_id : null;
        $studentGrade = $student ? $student->grade : null;
        
        if (!$studentId) {
            return $this->handleErrorResponse($request, 'Student profile not found');
        }
        
        try {
            // Get courses the student is registered for
            $registeredCourseIds = StudentCourse::where('student_id', $studentId)
                ->where('status', 'active')
                ->pluck('course_id')
                ->toArray();
                
            // Get teacher IDs associated with these courses
            $teacherIds = \DB::table('courses')
                ->whereIn('course_id', $registeredCourseIds)
                ->pluck('teacher_id')
                ->toArray();
                
            // Get user IDs associated with these teacher IDs
            $teacherUserIds = \DB::table('teachers')
                ->whereIn('tea_id', $teacherIds)
                ->pluck('user_id')
                ->toArray();
                
            // Get admin notices visible to students
            $adminNotices = Notice::whereJsonContains('visibility', 'All Students')
            ->orWhereJsonContains('visibility', 'Students')
            ->orWhereJsonContains('visibility', 'All')
            ->with(['user' => function($query) {
                $query->select('id', 'name');
                $query->with('admin:user_id,admin_id'); 
            }])
            ->get();
            
            // Add role_name for admin users
            foreach ($adminNotices as $notice) {
                if ($notice->user && $notice->user->admin) {
                    $notice->user->role_name = 'Admin';
                }
            }
                
            // Get all teacher notices that might be relevant (includes grade-specific notices)
            $teacherNotices = Notice::whereIn('user_id', $teacherUserIds)
            ->where(function($query) use ($studentGrade) {
                $query->whereJsonContains('visibility', 'All Students')
                    ->orWhereJsonContains('visibility', 'Students')
                    ->orWhereJsonContains('visibility', 'All')
                    // Add check for grade-specific visibility
                    ->orWhereJsonContains('visibility', $studentGrade);
            })
            ->with(['user' => function($query) {
                $query->select('id', 'name')
                    ->with('teacher:user_id,tea_id');
            }])
            ->get();
                
            // Merge the collections
            $notices = $adminNotices->merge($teacherNotices)->sortByDesc('created_at')->values();
            
            // Add course information to each notice
            foreach ($notices as $notice) {
                if (in_array($notice->user_id, $teacherUserIds)) {
                    // Find which course this teacher teaches that the student is registered for
                    $teacherId = \DB::table('teachers')
                        ->where('user_id', $notice->user_id)
                        ->value('tea_id');
                        
                    $courseInfo = \DB::table('courses')
                        ->where('teacher_id', $teacherId)
                        ->whereIn('course_id', $registeredCourseIds)
                        ->select('course_id', 'course_name', 'grade')
                        ->first();
                        
                    if ($courseInfo) {
                        $notice->course_id = $courseInfo->course_id;
                        $notice->course_name = $courseInfo->course_name;
                        $notice->course_grade = $courseInfo->grade;
                    }
                    
                    // If this is a grade-specific notice, tag it
                    if ($notice->visibility && is_array($notice->visibility)) {
                        $isGradeSpecific = false;
                        $gradeSpecificFor = [];
                        
                        foreach ($notice->visibility as $item) {
                            if ($item !== 'All Students' && $item !== 'Students' && $item !== 'All') {
                                $isGradeSpecific = true;
                                $gradeSpecificFor[] = $item;
                            }
                        }
                        
                        if ($isGradeSpecific) {
                            $notice->is_grade_specific = true;
                            $notice->grade_name = implode(', ', $gradeSpecificFor);
                        }
                    }
                }
            }
            
            // Check if it's an API request but NOT an Inertia request
            if (($request->ajax() || $request->wantsJson()) && !$request->header('X-Inertia')) {
                return response()->json($notices);
            }
            
            // For Inertia requests, return Inertia page with notices as props
            return Inertia::render('Student/Notices', [
                'initialNotices' => $notices
            ]);
            
        } catch (\Exception $e) {
            return $this->handleErrorResponse($request, 'Failed to load notices: ' . $e->getMessage());
        }
    }
    
    /**
     * Get registered courses for the student.
     */
    public function getRegisteredCourses(Request $request)
    {
        // Get student ID from auth user
        $studentId = Auth::user()->student->student_id ?? null;
        
        if (!$studentId) {
            return response()->json([
                'success' => false,
                'message' => 'Student profile not found'
            ], 404);
        }
        
        try {
            // Get courses the student is registered for with course and teacher info
            $courses = \DB::table('student_courses')
                ->join('courses', 'student_courses.course_id', '=', 'courses.course_id')
                ->where('student_courses.student_id', $studentId)
                ->where('student_courses.status', 'active')
                ->select(
                    'courses.course_id', 
                    'courses.course_name', 
                    'courses.teacher_id'
                )
                ->get();
                
            return response()->json([
                'success' => true,
                'courses' => $courses
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load registered courses: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getRegisteredGrades(Request $request)
    {
        try {
            // Get the authenticated student
            $student = Auth::user()->student;
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'No student record found for this user',
                    'grades' => []
                ], 404);
            }
            
            // Get grades from courses the student is registered for
            $courseGrades = \DB::table('student_courses')
                ->join('courses', 'student_courses.course_id', '=', 'courses.course_id')
                ->where('student_courses.student_id', $student->student_id)
                ->where('student_courses.status', 'active')
                ->pluck('courses.grade')
                ->unique()
                ->values()
                ->toArray();
            
            // Always include the student's own grade
            if ($student->grade && !in_array($student->grade, $courseGrades)) {
                $courseGrades[] = $student->grade;
            }
            
            // Always include the default visibility options that apply to all students
            $grades[] = 'All Students';
            $grades[] = 'Students';
            $grades[] = 'All';
            
            return response()->json([
                'success' => true,
                'grades' => array_values(array_unique(array_merge($courseGrades, $grades)))
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve registered grades: ' . $e->getMessage(),
                'grades' => ['All Students', 'Students', 'All'] // Fallback
            ], 500);
        }
    }
    
    /**
     * Handle error responses consistently.
     */
    private function handleErrorResponse(Request $request, $message, $statusCode = 500)
    {
        if (($request->ajax() || $request->wantsJson()) && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => false,
                'message' => $message
            ], $statusCode);
        }
        
        return Inertia::render('Student/Notices', [
            'initialNotices' => [],
            'error' => $message
        ]);
    }
}