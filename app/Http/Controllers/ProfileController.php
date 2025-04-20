<?php

namespace App\Http\Controllers;

use App\Models\UserRegistration;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = Auth::user();
        
        // Check if user exists
        if (!$user) {
            return redirect('/');
        }
        
        $userRegistration = $user->registration;
        
        // Use debug logging to understand what data we're getting
        \Log::debug('User Registration Data:', [
            'user_id' => $user->id,
            'registration_exists' => (bool)$userRegistration,
            'role_exists' => $userRegistration && $userRegistration->role ? true : false,
        ]);
        
        // Handle the case where registration or role might be null
        $userRole = 'guest'; // Default role
        $roleSpecificData = null;
        
        // Only proceed with role-specific logic if registration and role exist
        if ($userRegistration && $userRegistration->role) {
            $userRole = strtolower($userRegistration->role->role_name);
            
            // Get role-specific data
            if ($userRole === 'admin') {
                $roleSpecificData = Admin::where('user_id', $user->id)->first();
            } elseif ($userRole === 'teacher') {
                $roleSpecificData = Teacher::where('user_id', $user->id)->first();
                // Get teacher's courses
                $roleSpecificData->courses = $roleSpecificData->courses ?? [];
            } elseif ($userRole === 'student') {
                $roleSpecificData = Student::where('user_id', $user->id)->first();
                // Get student's registered courses
                $roleSpecificData->courses = $roleSpecificData->registeredCourses ?? [];
            }
        }
        
        return Inertia::render('Profile/Edit', [
            'user' => $user,
            'userRegistration' => $userRegistration ?: (object)[], // Ensure we at least send an empty object
            'userRole' => $userRole,
            'roleSpecificData' => $roleSpecificData
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $userRegistration = $user->registration;
        
        // Basic validation for all users
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email,'.$user->id,
        ]);
        
        // Update user email
        $user->email = $validated['email'];
        $user->save();
        
        // Only update registration details if we have a registration record
        if ($userRegistration) {
            // Validate registration fields
            $registrationValidated = $request->validate([
                'title' => 'required|string|max:10',
                'first_name' => 'required|string|max:250',
                'last_name' => 'required|string|max:250',
                'tel_no' => 'required|string|max:25',
                'address' => 'required|string',
            ]);
            
            // Handle profile image upload
            if ($request->hasFile('image')) {
                $registrationValidated['image'] = $this->handleImageUpload($request, $userRegistration);
            }
            
            // Update user registration
            $userRegistration->update([
                'title' => $registrationValidated['title'],
                'first_name' => $registrationValidated['first_name'],
                'last_name' => $registrationValidated['last_name'],
                'tel_no' => $registrationValidated['tel_no'],
                'address' => $registrationValidated['address'],
            ]);
            
            // Handle role-specific updates if role exists
            if ($userRegistration->role) {
                $userRole = strtolower($userRegistration->role->role_name);
                
                if ($userRole === 'admin' && $request->has('nic')) {
                    Admin::where('user_id', $user->id)->update([
                        'nic' => $request->nic,
                    ]);
                } elseif ($userRole === 'teacher') {
                    if ($request->has('nic') && $request->has('qualifications')) {
                        Teacher::where('user_id', $user->id)->update([
                            'nic' => $request->nic,
                            'qualifications' => $request->qualifications,
                        ]);
                    }
                } elseif ($userRole === 'student') {
                    if ($request->has('parent_info')) {
                        // Handle parent information update
                        $student = Student::where('user_id', $user->id)->first();
                        if ($student && $student->parent_id) {
                            $parent = $student->parent;
                            $parent->update($request->parent_info);
                        }
                    }
                }
            }
        }
        
        return redirect()->back()->with('message', 'Profile updated successfully');
    }
    
    private function handleImageUpload(Request $request, $userRegistration)
    {
        $file = $request->file('image');
        $fileName = time() . '_' . $file->getClientOriginalName();
        
        // Delete old image if it exists
        if ($userRegistration->image && Storage::exists('public/profiles/' . $userRegistration->image)) {
            Storage::delete('public/profiles/' . $userRegistration->image);
        }
        
        // Store new image
        $path = $file->storeAs('profiles', $fileName, 'public');
        
        return $fileName;
    }

    public function destroy(Request $request)
    {
        // Handle account deletion
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}