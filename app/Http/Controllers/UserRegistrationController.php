<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRegistration;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserRegistrationController extends Controller
{
    



    public function register(Request $request)
    {
        // Validate the request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => 'required|string',
            'dob' => 'nullable|date',
            'role' => 'required|string',
            'grade' => 'required|string|max:255',
        ]);

        // Create the user in the users table
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create the user registration details in user_registrations table

        UserRegistration::create([
            'registration_id' => null, // Assuming this is auto-incremented
            'title' => $request->input('title', 'default_title'), // Add title if needed
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'gender' => $request->gender,
            'dob' => $request->dob,

            'role' => $request->role,

            'tel_no' => $request->tel_no,
            'address' => $request->address,
            'image' => null, // Set a default value or leave null if not uploaded
            'status' => 'active', // Set a default status if required
            'user_id' => $user->id, // Reference the newly created user
            'added_by' => auth()->user()->id, // Assuming you're getting the current user's ID


        ]);


        Student::create([
            'u_id' => $user->id,
            'grade' => $request->grade,
            'QR_id' => null,
            'parent_id' => null,
        ]);


         // Return a success response
         return redirect()->back()->with('success', 'User registered successfully!');
        // return redirect()->route('dashboard')->with('success', 'Registration successful!');

        //return response()->json(['message' => 'User registered successfully.']);

    }
}
