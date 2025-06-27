<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Parents;
use App\Models\User;
use App\Models\UserRegistration;
use App\Models\Student;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Auth\Events\Registered; // for user verification
use Illuminate\Support\Facades\Mail;
use App\Mail\SendPasswordEmail; // You'll create this Mailable class
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Log;
use App\Models\StudentCourse;
use Illuminate\Validation\Rules;

class UserRegistrationController extends Controller
{

    /**
     * Get all available courses (for teacher registration)
     * This returns all courses with their details
     */
    public function getAllCourses()
    {
        $courses = Course::select('course_id', 'course_name', 'subject', 'grade', 'monthly_fees')
            ->orderBy('grade')
            ->orderBy('course_name')
            ->get();
            
        return response()->json($courses);
    }

    /**
     * Get all available grades (for filtering courses)
     * This returns distinct grades from the courses table
     */
    public function getGrades()
    {
        $grades = Course::select('grade')
            ->distinct()
            ->orderBy('grade')
            ->get();
            
        return response()->json($grades);
    }



    // Function to get courses by grade (for AJAX)
    public function getCoursesByGrade(Request $request)
    {
        $grade = $request->grade;
        $courses = Course::where('grade', $grade)
        ->select('course_id', 'course_name', 'course_desc', 'subject', 'monthly_fees')
        ->get();
        return response()->json($courses);
    }

    public function searchCourses(Request $request)
    {
        $search = $request->search;
        $courses = Course::where('course_name', 'LIKE', "%{$search}%")
            ->orWhere('subject', 'LIKE', "%{$search}%")
            ->orWhere('course_id', 'LIKE', "%{$search}%")
            ->select('course_id', 'course_name', 'subject', 'grade')
            ->get();
            
        return response()->json($courses);
    }

    /**
     * Register a new user (handles all user types: student, teacher, admin)
     * Comprehensive registration method that handles different validation rules
     * and database operations based on user type
     */
    
    public function registerUser(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validate common fields
            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'gender' => 'required|in:Male,Female',
                'dob' => 'required|date',
                'tel_no' => 'required|string|max:20',
                'address' => 'required|string',
                'role' => 'required|in:admin,teacher,student',
            ]);

            // Generate a temporary password
            $password = Str::random(12);

            // Create user
            $user = User::create([
                'name' => $request->first_name . ' ' . $request->last_name,
                'email' => $request->email,
                'password' => Hash::make($password),
            
            ]);

            // Create user registration
            $userRegistration = UserRegistration::create([
                'user_id' => $user->id,
                'role_id' => $this->getRoleId($request->role),
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'gender' => $request->gender,
                'dob' => $request->dob,
                'tel_no' => $request->tel_no,
                'address' => $request->address,
                'status' => true,
                'added_by' => auth()->id()
            ]);

            // Handle role-specific registration
            switch ($request->role) {
                case 'student':
                    $this->registerStudent($request, $user->id);
                    break;
                case 'teacher':
                    $this->registerTeacher($request, $user->id);
                    break;
                case 'admin':
                    $this->registerAdmin($request, $user->id);
                    break;
            }

            DB::commit();

            // Always return JSON response
            return response()->json([
                'status' => 'success',
                'message' => ucfirst($request->role) . ' registered successfully!',
                'data' => [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $request->role,
                    'temporary_password' => $password // Only for development
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User registration error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Always return JSON response for errors
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed: ' . $e->getMessage(),
                'errors' => $e instanceof \Illuminate\Validation\ValidationException ? $e->errors() : null
            ], 500);
        }
    }

    private function registerStudent(Request $request, $userId)
    {
        // Validate student-specific fields
        $request->validate([
            'parent_first_name' => 'required|string|max:255',
            'parent_last_name' => 'required|string|max:255',
            'parent_phone_number' => 'required|string|max:20',
            'relationship_type' => 'required|string|max:50',
            'grade' => 'required|string|max:10',
            'courses' => 'required|array'
        ]);

        try {
            // Create parent
            $parent = Parents::create([
                'parent_first_name' => $request->parent_first_name,
                'parent_last_name' => $request->parent_last_name,
                'parent_phone_number' => $request->parent_phone_number,
                'relationship_type' => $request->relationship_type
            ]);

            // Create student
            $student = Student::create([
                'user_id' => $userId,
                'parent_id' => $parent->parent_id,
                'grade' => $request->grade
            ]);

            // Create student-course relationships
            foreach ($request->courses as $courseId) {
                StudentCourse::create([
                    'student_id' => $student->student_id,
                    'course_id' => $courseId,
                    'status' => 'active',
                    'registered_date_time' => now()
                ]);
            }

            Log::info('Student registration completed successfully', [
                'user_id' => $userId,
                'student_id' => $student->student_id,
                'parent_id' => $parent->parent_id
            ]);

        } catch (\Exception $e) {
            Log::error('Student registration error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    private function registerTeacher(Request $request, $userId)
    {
        // Validate teacher-specific fields
        $request->validate([
            'nic' => 'required|string|max:20',
            'qualifications' => 'required|string',
            'courses' => 'required|array'
        ]);

        // Create teacher
        $teacher = Teacher::create([
            'user_id' => $userId,
            'nic' => $request->nic,
            'qualifications' => $request->qualifications
        ]);

        // Update courses with teacher_id
        Course::whereIn('course_id', $request->courses)
            ->update(['teacher_id' => $teacher->tea_id]);
    }

    private function registerAdmin(Request $request, $userId)
    {
        // Add any admin-specific registration logic here
        // For now, we just need the user and user_registration records
    }

    private function getRoleId($role)
    {
        $roles = [
            'admin' => 1,
            'teacher' => 2,
            'student' => 3
        ];
        return $roles[$role] ?? 1;
    }

    /**
     * Show the registration form based on user type
     * These methods return the appropriate view for each user type
     */
    public function showAdminRegisterForm()
    {
        return inertia('Auth/AdminRegister');
    }
    
    public function showTeacherRegisterForm()
    {
        // You may want to pass available courses to the view
        $courses = Course::select('course_id', 'course_name', 'subject', 'grade')->get();
        return inertia('Auth/TeacherRegister', [
            'courses' => $courses
        ]);
    }
    
    public function showStudentRegisterForm()
    {
        // Get all available grades to populate the dropdown
        $grades = Course::select('grade')->distinct()->orderBy('grade')->get();
        return inertia('Auth/StudentRegister', [
            'grades' => $grades
        ]);
    }
    
    /**
     * Register method for specifically students (kept for backward compatibility)
     * This is your original register method, modified to use the new structure
     */
    public function register(Request $request)
    {
        // Set the user type to student and call the main registerUser method
        $request->merge(['user_type' => 'student']);
        return $this->registerUser($request);
    }
    
    /**
     * Method to create a new course (admin functionality)
     * This adds a new course to the database as shown in your first image
     */
    public function createCourse(Request $request)
    {
        $validated = $request->validate([
            'subject_code' => 'required|string|max:50|unique:courses,course_id',
            'subject_name' => 'required|string|max:255',
            'teacher_id' => 'nullable|exists:teacher_details,id',
            'grade' => 'required|string|max:20',
            'course_fee' => 'required|numeric|min:0',
            'course_description' => 'required|string',
        ]);
        
        try {
            $course = Course::create([
                'course_id' => $validated['subject_code'],
                'course_name' => $validated['subject_name'],
                'subject' => $validated['subject_name'], // You might want to separate subject and course name
                'course_desc' => $validated['course_description'],
                'grade' => $validated['grade'],
                'monthly_fees' => $validated['course_fee'],
                // If teacher_id is provided, associate the course with the teacher
                'teacher_id' => $validated['teacher_id'] ?? null,
            ]);
            
            // If teacher_id is provided, also create an entry in teacher_courses
            if ($validated['teacher_id']) {
                TeacherCourse::create([
                    'teacher_id' => $validated['teacher_id'],
                    'course_id' => $course->course_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Course created successfully',
                    'course' => $course
                ], 201);
            }
            
            return redirect()->route('admin.courses')
                ->with('message', 'Course created successfully');
                
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Course creation failed',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Course creation failed: ' . $e->getMessage()]);
        }
    }
}