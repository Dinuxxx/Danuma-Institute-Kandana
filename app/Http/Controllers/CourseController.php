<?php


namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Course;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\StudentCourse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
//use App\Http\Controllers\Log;

class CourseController extends Controller{
    /**
     * Store a newly created course in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'subjectCode' => 'required|string|max:255|unique:courses,course_id',
            'subjectName' => 'required|string|max:255',
            // 'teacherId' => 'required|string|max:255',
            'teacherId' => 'nullable|integer|exists:teachers,tea_id',
            'grade' => 'required|string|max:10',
            'courseFee' => 'required|numeric',
            'courseDesc' => 'nullable|string',
        ]);
        
        $existingCourse = Course::where('course_name', $validatedData['subjectName'])
            ->where('grade', $validatedData['grade'])
            ->exists();
        
        if ($existingCourse) {
            return response([
                'errors' => [
                    'subjectName' => 'This subject name and grade combination already exists.',
                    'grade' => 'This subject name and grade combination already exists.'
                ]
            ], 422);
        }
        
        $course = Course::create([
            'course_id' => $validatedData['subjectCode'],
            'course_name' => $validatedData['subjectName'],
            'monthly_fees' => $validatedData['courseFee'],
            'course_desc' => $validatedData['courseDesc'],
            'teacher_id' => $validatedData['teacherId'],
            'grade' => $validatedData['grade'],
        ]);
        
        return response(['message' => 'Course created successfully!', 'course' => $course]);
    }


    //The index method retrieves all courses from the database and returns them as JSON. This is used when listing all courses.

    /**
     * Display a listing of the courses.
     *
     * @return \Illuminate\Http\Response
     */

    public function index()
    {
        $courses = Course::all();
        return response($courses);
    }

    /**
     * Get teacher details including user registration info
     *
     * @param int $id Teacher ID
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $teacher = Teacher::with(['user.registration'])->find($id);
        
        if (!$teacher) {
            return response(['error' => 'Teacher not found'], 404);
        }
        
        return response($teacher);
    }

    /**
     * Get count of all courses.
     *
     * @return \Illuminate\Http\Response
     */
    public function getCoursesCount()
    {
        $count = Course::count(); // Assuming you have a Course model
        return response(['count' => $count]);
    }



    //finds a course by ID and renders the EditCourse Inertia component, passing the course data to it.

    /**
     * Show the form for editing the specified course.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */

    public function edit($id)
    {
        $course = Course::findOrFail($id);
        return inertia('Admin/EditCourse', [
            'course' => $course
        ]);
    }


    //Gets unique grade values from all courses. The distinct() method ensures no duplicates, and pluck('grade') extracts just the grade values. Returns the array as JSON.
    public function getGrades()
    {
        $grades = Course::distinct('grade')->pluck('grade')->toArray();
        return response()->json($grades);
    }

    public function getCoursesByGrade($grade)
    {
        $courses = Course::where('grade', $grade)->get([
            'course_id', 
            'course_name', 
            'grade', 
            'teacher_id'
        ]);
        
        return response()->json($courses);
    }


    /**
     * Update the specified course in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        
        $validatedData = $request->validate([
            'subjectCode' => 'required|string|max:255',
            'subjectName' => 'required|string|max:255',
            'teacherId' => 'nullable|integer|exists:teachers,tea_id',
            'grade' => 'required|string|max:10',
            'courseFee' => 'required|numeric',
            'courseDesc' => 'nullable|string',
        ]);
        
        $course->update([
            'course_id' => $validatedData['subjectCode'],
            'course_name' => $validatedData['subjectName'],
            'monthly_fees' => $validatedData['courseFee'],
            'course_desc' => $validatedData['courseDesc'],
            'teacher_id' => $validatedData['teacherId'],
            'grade' => $validatedData['grade'],
        ]);
        
        if ($request->wantsJson()) {
            return response()->json(['message' => 'Course updated successfully']);
        }
        
        return redirect()->route('admin.courses')
            ->with('message', 'Course updated successfully');
    }

    /**
     * Remove the specified course from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();
        
        if (request()->wantsJson()) {
            return response(['success' => true]);
        }
        
        return Redirect::route('admin.courses');
    }

    /**
     * Get courses for the authenticated teacher.
     *
     * @return \Illuminate\Http\Response
     */
    public function teacherCourses()
    {
        $user = auth()->user();
        $teacher = \App\Models\Teacher::where('user_id', $user->id)->first();
        
        if (!$teacher) {
            return response()->json([]);
        }
        
        $courses = Course::where('teacher_id', $teacher->tea_id)->get();
        return response()->json($courses);
    }

    /**
     * Get courses registered by the authenticated student
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function studentRegisteredCourses()
    {
        try {
            // Get the current user
            $user = Auth::user();
            
            // Find the student record for this user
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json(['courses' => [], 'totalDue' => 0], 200);
            }
            
            // Get the courses this student is registered for
            $registeredCourseIds = StudentCourse::where('student_id', $student->student_id)
                ->where('status', 'active')
                ->pluck('course_id');
                
            $courses = Course::whereIn('course_id', $registeredCourseIds)
                ->get()
                ->map(function($course) {
                    // Add teacher name if available
                    if ($course->teacher_id) {
                        $teacher = \App\Models\Teacher::find($course->teacher_id);
                        if ($teacher && $teacher->user) {
                            $course->teacher_name = $teacher->user->first_name . ' ' . $teacher->user->last_name;
                        } else {
                            $course->teacher_name = "Unknown Teacher";
                        }
                    } else {
                        $course->teacher_name = "No Teacher Assigned";
                    }
                    
                    return $course;
                });
            
            // Calculate total due (you'll need to implement this logic based on your payment system)
            $totalDue = 0;
            // Example: Sum up the monthly fees of all courses
            foreach ($courses as $course) {
                $totalDue += $course->monthly_fees;
            }
                
            return response()->json([
                'courses' => $courses,
                'totalDue' => $totalDue
            ]);
            
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Error fetching student courses: ' . $e->getMessage());
            
            // Return a formatted error response
            return response()->json(['error' => 'Failed to retrieve courses'], 500);
        }
    }

    public function getTeacherGrades()
    {
        try {
            $user = Auth::user();
            $teacher = \App\Models\Teacher::where('user_id', $user->id)->first();
            
            if (!$teacher) {
                return response()->json(['grades' => []], 200);
            }
            
            // Get unique grades from courses taught by this teacher
            $grades = Course::where('teacher_id', $teacher->tea_id)
                ->distinct()
                ->pluck('grade')
                ->toArray();
            
            // Always include "All Students" option
            $gradeOptions = ['All Students'];
            
            // Format the grades as "Grade X"
            foreach ($grades as $grade) {
                $gradeOptions[] = "Grade $grade";
            }
            
            return response()->json(['grades' => $gradeOptions], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching teacher grades: ' . $e->getMessage());
            return response()->json(['grades' => [], 'error' => $e->getMessage()], 500);
        }
    }

    public function checkCourseAvailability($courseIds)
    {
        $unavailableCourses = Course::whereIn('course_id', $courseIds)
            ->whereNotNull('teacher_id')
            ->where('teacher_id', '!=', '')
            ->get();

        if ($unavailableCourses->isNotEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Some selected courses are no longer available',
                'unavailable_courses' => $unavailableCourses
            ], 422);
        }

        return response()->json(['status' => 'success']);
    }

    public function getAvailableCoursesForTeacher()
    {
        try {
            // Get all courses
            $courses = Course::select(
                'course_id',
                'course_name',
                'grade', 
                'monthly_fees',
                'course_desc',
                'teacher_id'
            )
            ->whereNull('teacher_id')  // Get courses with no teacher
            ->orWhere('teacher_id', '') // Or empty teacher_id
            ->orderBy('grade')
            ->orderBy('course_name')
            ->get();

            if ($courses->isEmpty()) {
                Log::info('No available courses found');
                return response()->json([]);
            }

            Log::info('Available courses found:', ['count' => $courses->count()]);
            return response()->json($courses);

        } catch (\Exception $e) {
            Log::error('Error fetching available courses: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch available courses'
            ], 500);
        }
    }
}