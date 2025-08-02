<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Teacher;
use App\Models\Course;
use App\Models\TeacherCourse; // If you have a pivot table
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;

class TeacherController extends Controller
{
    /**
     * Get available courses that don't have a teacher assigned
     * or all courses depending on your business logic
     */
    public function getAvailableCourses()
    {
        try {
            // Option 1: Get courses without assigned teachers
            $courses = Course::whereNull('teacher_id')
                ->orWhere('teacher_id', 0)
                ->select('course_id', 'course_name', 'grade', 'monthly_fees')
                ->orderBy('grade')
                ->orderBy('course_name')
                ->get();

            // Option 2: If you want to allow multiple teachers per course
            // $courses = Course::select('course_id', 'course_name', 'grade', 'monthly_fees')
            //     ->orderBy('grade')
            //     ->orderBy('course_name')
            //     ->get();

            return response()->json($courses);
        } catch (\Exception $e) {
            Log::error('Error fetching available courses: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch courses'], 500);
        }
    }

    /**
     * Handle a registration request for a new teacher.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'address' => 'required|string',
            'tel_no' => 'required|string|regex:/^0\d{9}$/',
            'dob' => 'required|date',
            'gender' => 'required|string|in:Male,Female',
            'nic' => 'required|string|regex:/^(\d{9}[vVxX]|\d{12})$/|unique:teachers',
            'qualifications' => 'required|string|max:255',
            'courses' => 'required|array|min:1',
            'courses.*' => 'exists:courses,course_id',
            'name' => 'string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            DB::beginTransaction();

            // Create user first
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Then create the teacher record
            $teacher = Teacher::create([
                'user_id' => $user->id,
                'nic' => $request->nic,
                'qualifications' => $request->qualifications,
                // salary is nullable for now as per requirements
            ]);

            // Update the courses with teacher_id
            Course::whereIn('course_id', $request->courses)
                ->update(['teacher_id' => $teacher->tea_id]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Teacher registered successfully!',
                'teacher' => $teacher,
            ], 201)->toResponse($request);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Teacher registration error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Teacher registration failed.',
                'error' => $e->getMessage(),
            ], 500)->toResponse($request);
        }
    }
}