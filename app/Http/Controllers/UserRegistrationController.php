<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;



class UserRegistrationController extends Controller
{
    //

    public function register(Request $request)
    {
        // Validate the form data
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'address' => 'required|string|max:255',
            'tel_no' => 'required|string|max:15',
            'dob' => 'required|date',
            'gender' => 'required|in:Male,Female',
        ]);

        // Step 1: Create a new user in the users table
        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name,
            'email' => $request->email,
            'password' => Hash::make('default_password'), // Set a default password or generate one
        ]);

        // Step 2: Create a new record in the user_registrations table
        UserRegistration::create([
            'registration_id' => null, // Assuming this is auto-incremented
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
            'added_by' => auth()->user()->id, // Assuming you're getting the current user's ID

            
        ]);

        // Return a success response
        return redirect()->back()->with('success', 'User registered successfully!');
        //return redirect()->route('dashboard')->with('success', 'Registration successful!');
    }
}
