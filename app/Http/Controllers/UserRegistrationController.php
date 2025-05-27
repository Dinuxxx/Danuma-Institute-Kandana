<?php

namespace App\Http\Controllers;

use App\Models\Parents;
use App\Models\User;
use App\Models\UserRegistration;
use App\Models\Student;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Auth\Events\Registered; // for user verification
use Illuminate\Support\Facades\Mail;
use App\Mail\SendPasswordEmail; // You'll create this Mailable class


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
        // Validate the request data
        $commonRules = [
            'name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'address' => 'required|string|max:255',
            'tel_no' => 'required|digits:10',
            'dob' => 'nullable|date',
            'gender' => 'required|string|in:male,female',
            //'password' => 'required|string|min:8|confirmed',          
            //'parent_first_name' => 'required|string|max:255',
            //'parent_last_name' => 'required|string|max:255',
            //'parent_phone_number' => 'required|digits_between:10,15',
            //'relationship_to_student' => 'required|string|max:255',
            //'role' => 'required|string',
            //'grade' => 'required|string|max:255',
            //'courses' => 'required|array|min:1', // Array of selected course IDs
            //'courses.*'=> 'required|exists:courses,course_id',// Validate each course ID exists
        ];

        //$password = "sdadasdadadadadd"; // Generate a random password of 12 characters



        // Get user type from request
        $userType = $request->input('user_type');
        $roleId = null;

        // Set role ID and role-specific validation rules based on user type
        switch ($userType) {
            case 'teacher':
                $roleId = 2; // Assuming 2 is the role_id for teachers
                $roleRules = [
                    //'subject' => 'required|string',
                    
                    //'selected_grades' => 'sometimes|array',
                    //'selected_courses.*' => 'exists:courses,course_id',
                    'qualifications' => 'required|string',
                    'selected_courses' => 'sometimes|array',
                    'selected_courses.*' => 'exists:courses,course_id',
                    'salary' => 'nullable|numeric',
                    'nic' => 'required|string|max:12',
                ];
                break;
                
            case 'student':
                $roleId = 3; // Assuming 3 is the role_id for students
                $roleRules = [
                    'grade' => 'required|string',
                    'parent_first_name' => 'required|string',
                    'parent_last_name' => 'required|string',
                    'parent_phone_number' => 'required|string',
                    'relationship_to_student' => 'required|string',
                    'courses' => 'sometimes|array',
                    'courses.*' => 'exists:courses,course_id',
                ];
                break;
                
            case 'admin':
                $roleId = 1; // Assuming 1 is the role_id for admins
                $roleRules = [
                    //'admin_level' => 'required|integer|min:1|max:3',
                    'salary' => 'nullable|numeric',
                    'nic' => 'required|string|max:12',
                ];
                break;
                
            default:
                return back()->withErrors(['user_type' => 'Invalid user type']);
        }

        // Merge common and role-specific validation rules
        $validationRules = array_merge($commonRules, $roleRules);
        
        // Validate the request
        $validated = $request->validate($validationRules);

        // Create transaction to ensure all operations succeed or fail together
        DB::beginTransaction();

        try {
            // Generate random password for the user
            $password = Str::random(12);
            
            // Create the base user
            $user = User::create([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make($password),
            ]);
            
            // Send the password to the user via email
            Mail::to($user->email)->send(new SendPasswordEmail($password));
            
            // Trigger email verification event
            event(new Registered($user));
            
            // Handle image upload if present
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('user_images', 'public');
            }
            
            // Create user registration entry
            $registration = UserRegistration::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'gender' => $validated['gender'],
                'dob' => $validated['dob'],
                'tel_no' => $validated['tel_no'],
                'address' => $validated['address'],
                'image' => $imagePath,
                'status' => 'active', // Default status
                'user_id' => $user->id,
                'role_id' => $roleId,
                'added_by' => auth()->id() ?? 1, // Current admin or default
            ]);
            
            // Handle role-specific data
            switch ($userType) {
                case 'teacher':
                    $teacher = Teacher::create([
                        'user_id' => $user->id,
                        'salary' => $validated['salary'] ?? null,
                        'qualifications' => $validated['qualifications'],
                        'nic' => $validated['nic'],
                    ]);

                    // Handle teacher courses if provided
    if (!empty($validated['selected_courses'])) {
        foreach ($validated['selected_courses'] as $courseId) {
            // Update the course with this teacher's ID
            Course::where('course_id', $courseId)->update([
                'teacher_id' => $teacher->tea_id
            ]);
        }
    }
                            
                    break;
                    
                case 'student':
                    // Create parent first
                    $parent = Parent::create([
                        'parent_first_name' => $validated['parent_first_name'],
                        'parent_last_name' => $validated['parent_last_name'],
                        'parent_phone_number' => $validated['parent_phone_number'],
                        'relationship_type' => $validated['relationship_to_student'],
                    ]);
                    
                    $student = Student::create([
                        'user_id' => $user->id,
                        'grade' => $validated['grade'],
                        'QR_id' => 'STU' . str_pad($user->id, 6, '0', STR_PAD_LEFT), // Generate QR ID
                        'parent_id' => $parent->parent_id, // Use the parent ID from newly created parent
                    ]);
                    
                    // Enroll student in selected courses
                    // These are courses specific to the student's grade
                    $courseData = [];
                    foreach ($validated['courses'] as $courseId) {
                        $courseData[] = [
                            'registered_date_time' => now(),
                            'status' => 'active',
                            'student_id' => $student->id, // Use student ID (auto-increment primary key)
                            'course_id' => $courseId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                    
                    // Bulk insert all course registrations for better performance
                    if (!empty($courseData)) {
                        DB::table('student_courses')->insert($courseData);
                    }
                    break;
                    
                case 'admin':
                    Admin::create([
                        'user_id' => $user->id,
                        'salary' => $validated['salary'] ?? null,
                        'nic' => $validated['nic'],
                        //'admin_level' => $validated['admin_level'],
                    ]);
                    break;
            }
            
            DB::commit();
            
            // Return success response based on request type
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => ucfirst($userType) . ' registered successfully. Please verify your email.',
                    'status' => 'verification-link-sent',
                    'user' => $user
                ], 201);
            }
            
            // Redirect back to users list for web request
            return redirect()->route('admin.users')
                ->with('message', ucfirst($userType) . ' registered successfully. Verification email sent.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Return error response based on request type
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Registration failed',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
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