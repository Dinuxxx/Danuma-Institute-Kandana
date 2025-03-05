<?php

namespace App\Http\Controllers;

use App\Models\Parents;
use App\Models\User;
use App\Models\UserRegistration;
use App\Models\Student;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Str;
use Illuminate\Support\Facades\DB;

class UserRegistrationController extends Controller
{

    // Function to get courses by grade (for AJAX)
    public function getCoursesByGrade(Request $request)
    {
        $grade = $request->grade;
        $courses = Course::where('grade', $grade)
        ->select('course_id', 'course_name', 'course_desc', 'subject', 'monthly_fees')
        ->get();
        return response()->json($courses);
    }

    
    public function register(Request $request)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            //'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'address' => 'required|string|max:255',
            'tel_no' => 'required|digits:10',
            'dob' => 'nullable|date',
            'gender' => 'required|string|in:male,female',
            //'password' => 'required|string|min:8|confirmed',           
            'parent_first_name' => 'required|string|max:255',
            'parent_last_name' => 'required|string|max:255',
            'parent_phone_number' => 'required|digits_between:10,15',
            'relationship_to_student' => 'required|string|max:255',
            //'role' => 'required|string',
            'grade' => 'required|string|max:255',
            'courses' => 'required|array|min:1', // Array of selected course IDs
            'courses.*'=> 'required|exists:courses,course_id',// Validate each course ID exists
        ]);

        //$password = "sdadasdadadadadd"; // Generate a random password of 12 characters

        $password = Str::random(12); // Generate a random password of 12 characters

        /*$password = $this->generateTemporaryPassword();

        // Add this method to your controller
private function generateTemporaryPassword($length = 12)
{
    $lowercase = 'abcdefghijklmnopqrstuvwxyz';
    $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $numbers = '0123456789';
    $special = '!@#$%^&*()';

    $password = 
        $lowercase[random_int(0, strlen($lowercase) - 1)] .
        $uppercase[random_int(0, strlen($uppercase) - 1)] .
        $numbers[random_int(0, strlen($numbers) - 1)] .
        $special[random_int(0, strlen($special) - 1)];

    $remainingLength = $length - strlen($password);
    $allChars = $lowercase . $uppercase . $numbers . $special;

    for ($i = 0; $i < $remainingLength; $i++) {
        $password .= $allChars[random_int(0, strlen($allChars) - 1)];
    }

    // Shuffle the password
    $passwordArray = str_split($password);
    shuffle($passwordArray);
    return implode('', $passwordArray);
}*/

        // Create the user in the users table
        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name, // Full name,
            'email' => $request->email,
            'password' => Hash::make($password), // Hash the password before saving
        ]);

        // Create the user registration details in user_registrations table

        UserRegistration::create([
            //'registration_id' => null, // Assuming this is auto-incremented
            'title' => $request->input('title', 'default_title'), // Add title if needed
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'gender' => $request->gender,
            'dob' => $request->dob,
            'tel_no' => $request->tel_no,
            'address' => $request->address,
            'image' => null, // Set a default value or leave null if not uploaded
            'status' => 'active', // Set a default status if required
            'user_id' => $user->id, // Reference the newly created user
            'role_id' => $request->role_id ?? 3, //assuming 3 is for students
            'added_by' => auth()->user()->id, // Assuming you're getting the current user's ID

        ]);

        
        $parent = Parents::create([
            'first_name' => $request->parent_first_name,
            'last_name' => $request->parent_last_name,
            'tel_no'=> $request-> parent_phone_number,
            'relationship_type' => $request->relationship_to_student,
        ]);

        
        $student = Student::create([
            //'student_id' => $user->id,
            'grade' => $request->grade,
            'QR_id' => null,
            'parent_id' => $parent->parent_id,
            'user_id' =>$user->id,
        ]);


        /* // Insert courses into the student_courses table
        foreach ($request->courses as $course) {

            $course = Course::create([
                // TODO:  Please create a course before registering a student to course
            ]);


        DB::table('student_courses')->insert([
            'registered_date_time' => now(),  //current timestamp
            'status' => 'active', // or any default status
            'student_id' => $student->student_id,
            'course_id' => $course['id'],
        ]);*/

         // Assign selected courses to the student
         $courseData = [];
         foreach ($request->courses as $courseId) {
             $courseData[] = [
                 'registered_date_time' => now(),
                 'status' => 'active',
                 'student_id' => $student->student_id,
                 'course_id' => $courseId,
                 //'created_at' => now(),
                 //'updated_at' => now(),
             ];
         }
         
         // Bulk insert all course registrations
         if (!empty($courseData)) {
             DB::table('student_courses')->insert($courseData);
         }

        


         // Return a success response
         return redirect()->back()->with('success', 'User registered successfully!');
        // return redirect()->route('dashboard')->with('success', 'Registration successful!');

        //return response()->json(['message' => 'User registered successfully.']);

    }
}