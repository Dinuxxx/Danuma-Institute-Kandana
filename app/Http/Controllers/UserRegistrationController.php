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
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendPasswordEmail;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Log;
use App\Models\StudentCourse;
use Illuminate\Validation\Rules;
use App\Models\Role;

class UserRegistrationController extends Controller
{
    /**
     * Get all available courses (for teacher registration)
     * This returns all courses with their details
     */
    public function getAllCourses()
    {
        try {
            $courses = Course::select('course_id', 'course_name', 'grade', 'monthly_fees', 'course_desc', 'teacher_id')
                ->orderBy('grade')
                ->orderBy('course_name')
                ->get();
                
            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Error fetching all courses: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch courses'], 500);
        }
    }

    /**
     * Get available courses for teacher registration (courses without assigned teachers)
     * This is specifically for teacher registration where we only want unassigned courses
     */
    public function getAvailableCoursesForTeacher()
    {
        try {
            $courses = Course::select(
                'course_id', 
                'course_name', 
                'grade', 
                'monthly_fees', 
                'course_desc'
            )
            ->whereNull('teacher_id')
            ->orWhere('teacher_id', '')  // For empty string cases
            ->orderBy('grade')
            ->orderBy('course_name')
            ->get();
            
            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Error fetching available courses for teacher: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch available courses'
            ], 500);
        }
    }

    /**
     * Get all available grades (for filtering courses)
     * This returns distinct grades from the courses table
     */
    public function getGrades()
    {
        try {
            $grades = Course::select('grade')
                ->distinct()
                ->orderBy('grade')
                ->pluck('grade')
                ->toArray();
                
            return response()->json($grades);
        } catch (\Exception $e) {
            Log::error('Error fetching grades: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch grades'], 500);
        }
    }

    /**
     * Get courses by grade (for AJAX filtering)
     */
    public function getCoursesByGrade($grade)
    {
        try {
            $courses = Course::where('grade', $grade)
                ->select('course_id', 'course_name', 'course_desc', 'monthly_fees', 'teacher_id')
                ->get();
                
            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Error fetching courses by grade: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch courses for grade ' . $grade], 500);
        }
    }

    /**
     * Search courses by name, subject, or course ID
     */
    public function searchCourses(Request $request)
    {
        try {
            $search = $request->search;
            $courses = Course::where('course_name', 'LIKE', "%{$search}%")
                ->orWhere('course_id', 'LIKE', "%{$search}%")
                ->orWhere('course_desc', 'LIKE', "%{$search}%")
                ->select('course_id', 'course_name', 'grade', 'monthly_fees', 'teacher_id')
                ->get();
                
            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Error searching courses: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to search courses'], 500);
        }
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
            ]);

            // Determine role from the route or request
            $role = $this->determineRoleFromRequest($request);

            // Generate a temporary password
            $temporaryPassword = $request->password ?? Str::random(12);

            // Create user
            $user = User::create([
                'name' => trim($request->first_name . ' ' . $request->last_name),
                'email' => $request->email,
                'password' => Hash::make($temporaryPassword),
            ]);

            // Log the role lookup for debugging
            Log::info('Registration attempt:', ['role' => $role, 'email' => $request->email]);

            // Case-insensitive role lookup
            $roleRecord = Role::whereRaw('LOWER(role_name) = ?', [strtolower($role)])->first();
            
            if (!$roleRecord) {
                throw new \Exception('Role not found: ' . $role);
            }

            $userRegistration = UserRegistration::create([
                'user_id' => $user->id,
                'role_id' => $roleRecord->role_id,
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
            switch (strtolower($role)) {
                case 'student':
                    $this->registerStudent($request, $user->id);
                    break;
                case 'teacher':
                    $this->registerTeacher($request, $user->id); // Now passing user->id
                    break;
                case 'admin':
                    $this->registerAdmin($request, $user->id);
                    break;
                default:
                    throw new \Exception('Invalid role: ' . $role);
            }

            // Send password email only if we generated a temporary password
            if (!$request->password) {
                Mail::to($user->email)->send(new SendPasswordEmail($userRegistration, $temporaryPassword));
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => ucfirst($role) . ' registered successfully!',
                'data' => [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role,
                    'temporary_password' => !$request->password ? $temporaryPassword : null
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User registration error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Determine user role from request context
     */
    private function determineRoleFromRequest(Request $request)
    {
        // Check if role is explicitly provided
        if ($request->has('role')) {
            return $request->role;
        }

        // Determine from route name
        $routeName = $request->route()->getName();
        
        if (str_contains($routeName, 'teacher')) {
            return 'teacher';
        } elseif (str_contains($routeName, 'student')) {
            return 'student';
        } elseif (str_contains($routeName, 'admin')) {
            return 'admin';
        }

        // Default fallback
        return 'student';
    }

    /**
     * Register student with parent information and course enrollment
     */
    private function registerStudent(Request $request, $userId)
    {
        $request->validate([
            'parent_first_name' => 'required|string|max:255',
            'parent_last_name' => 'required|string|max:255',
            'parent_phone_number' => 'required|string|max:20',
            'relationship_type' => 'required|string|max:50',
            'grade' => 'required|string|max:10',
            'courses' => 'required|array|min:1',
            'courses.*' => 'exists:courses,course_id'
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
            throw $e;
        }
    }

    /**
     * Register teacher with qualifications and course assignments
     */
    private function registerTeacher(Request $request, $userId)
    {
        try {
            // Validate teacher-specific fields
            $request->validate([
                'nic' => [
                    'required',
                    'string',
                    'max:20',
                    'unique:teachers,nic',
                    'regex:/^[0-9]{9}[vVxX]$|^[0-9]{12}$/'
                ],
                'qualifications' => 'required|string|max:500',
                'courses' => [
                    'required',
                    'array',
                    'min:1',
                    function ($attribute, $value, $fail) {
                        // Check if any selected courses are already assigned
                        $assignedCourses = Course::whereIn('course_id', $value)
                            ->whereNotNull('teacher_id')
                            ->where('teacher_id', '!=', '')
                            ->get();

                        if ($assignedCourses->isNotEmpty()) {
                            $courseNames = $assignedCourses->pluck('course_name')->join(', ');
                            $fail("The following courses are already assigned to other teachers: {$courseNames}");
                        }
                    }
                ],
                'courses.*' => 'exists:courses,course_id'
            ]);

            // Create teacher record
            $teacher = Teacher::create([
                'user_id' => $userId,  // Use the passed $userId
                'nic' => $request->nic,
                'qualifications' => $request->qualifications,
                'salary' => 0
            ]);

            // Update courses with teacher_id
            if (!empty($request->courses)) {
                Course::whereIn('course_id', $request->courses)
                    ->update(['teacher_id' => $teacher->tea_id]);
            }

            Log::info('Teacher registration completed successfully', [
                'user_id' => $userId,
                'teacher_id' => $teacher->tea_id,
                'courses' => $request->courses
            ]);

            return $teacher;

        } catch (\Exception $e) {
            Log::error('Teacher registration error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Register admin (basic registration)
     */
    private function registerAdmin(Request $request, $userId)
    {
        // Add any admin-specific registration logic here
        // For now, we just need the user and user_registration records
        Log::info('Admin registration completed successfully', [
            'user_id' => $userId
        ]);
    }

    /**
     * Show the registration form based on user type
     */
    public function showAdminRegisterForm()
    {
        return inertia('Auth/AdminRegister');
    }
    
    public function showTeacherRegisterForm()
    {
        // Pass available courses to the view
        $courses = Course::select('course_id', 'course_name', 'grade', 'monthly_fees')
            ->whereNull('teacher_id')
            ->orWhere('teacher_id', '')
            ->orderBy('grade')
            ->orderBy('course_name')
            ->get();
            
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
     * Legacy register method for backward compatibility
     */
    public function register(Request $request)
    {
        return $this->registerUser($request);
    }
}