<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Settings');
    }

    /**
     * Update the user's account information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateAccount(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);
        
        // Update user name and email
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();
        
        // Update user registration phone number if it exists
        if ($user->registration) {
            $user->registration->tel_no = $validated['phone'];
            $user->registration->save();
        }
        
        return redirect()->back()->with('success', 'Account information updated successfully.');
    }

    /**
     * Update the user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'],
        ], [
            'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        ]);
        
        $user = $request->user();
        $user->password = bcrypt($validated['password']);
        $user->save();
        
        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    /**
     * Update the user's notification preferences.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'notifications_email' => ['boolean'],
            'notifications_sms' => ['boolean'],
        ]);
        
        // Here you would store these preferences in your database
        // For example, you might have a user_preferences table
        
        return redirect()->back()->with('success', 'Notification preferences updated successfully.');
    }

    /**
     * Update the user's appearance settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateAppearance(Request $request)
    {
        $validated = $request->validate([
            'theme' => ['required', 'string', 'in:light,dark,system'],
            'language' => ['required', 'string', 'in:en,si,ta'],
            'timezone' => ['required', 'string'],
        ]);
        
        // Here you would store these preferences in your database
        // For example, you might have a user_preferences table
        
        return redirect()->back()->with('success', 'Appearance settings updated successfully.');
    }
}