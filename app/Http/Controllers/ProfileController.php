<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
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
                
                // Add registration ID and join date for admin
                if ($roleSpecificData) {
                    $roleSpecificData->admin_id = $userRegistration->registration_id;
                    $roleSpecificData->created_at = $userRegistration->created_at;
                }
            } elseif ($userRole === 'teacher') {
                $roleSpecificData = Teacher::where('user_id', $user->id)->first();
                
                // Add teacher registration ID and join date
                if ($userRegistration) {
                    $roleSpecificData->teacher_id = $userRegistration->registration_id;
                    $roleSpecificData->created_at = $userRegistration->created_at;
                }
                
                // Get teacher's courses with students count and timetables
                if ($roleSpecificData) {
                    $courses = $roleSpecificData->courses()
                        ->with(['students', 'timeTables'])
                        ->get();
                    
                    \Log::debug('Teacher courses with timetables:', [
                        'teacher_id' => $roleSpecificData->tea_id,
                        'courses_count' => $courses->count(),
                        'first_course_timetables' => $courses->first() ? $courses->first()->timeTables->toArray() : 'No courses'
                    ]);
                    
                    $courses = $courses->map(function($course) {
                        $course->students_count = $course->students->count();
                        $course->timeTables = $course->timeTables;
                        return $course;
                    });
                    
                    $roleSpecificData->courses = $courses;
                } else {
                    $roleSpecificData->courses = [];
                }
            } elseif ($userRole === 'student') {
                $roleSpecificData = Student::where('user_id', $user->id)->first();
                
                // Get student's registered courses with status from pivot table
                if ($roleSpecificData) {
                    $roleSpecificData->courses = $roleSpecificData->courses()->get()->map(function($course) {
                        return [
                            'course_id' => $course->course_id,
                            'course_name' => $course->course_name,
                            'grade' => $course->grade,
                            'status' => $course->pivot->status
                        ];
                    })->toArray();
                    
                    // Load parent information
                    if ($roleSpecificData->parent_id) {
                        $roleSpecificData->parent = $roleSpecificData->parent;
                    }
                }
            }
        }
        
        return Inertia::render('Profile/Edit', [
            'user' => $user,
            'userRegistration' => $userRegistration ?: (object)[],
            'userRole' => $userRole,
            'roleSpecificData' => $roleSpecificData,
            'status' => session('status')
        ]);
    }

    public function update(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Validate the request
            $validated = $request->validate([
                'image' => ['nullable', 'image', 'max:1024'],
                'parent_info.first_name' => ['required_if:role,student', 'string', 'max:255'],
                'parent_info.last_name' => ['required_if:role,student', 'string', 'max:255'],
                'parent_info.tel_no' => ['required_if:role,student', 'string', 'max:15'],
                'parent_info.relationship_type' => ['required_if:role,student', 'string', 'in:father,mother,guardian'],
            ]);

            DB::beginTransaction();

            // Handle image upload if present
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('profiles', 'public');
                $user->registration->update(['image' => basename($imagePath)]);
            }

            // Update guardian information if user is student
            if ($user->registration && $user->registration->role->role_name === 'student' && $request->has('parent_info')) {
                $student = Student::where('user_id', $user->id)->first();
                
                if ($student) {
                    $student->update([
                        'parent_first_name' => $validated['parent_info']['first_name'],
                        'parent_last_name' => $validated['parent_info']['last_name'],
                        'parent_phone_number' => $validated['parent_info']['tel_no'],
                        'relationship_type' => $validated['parent_info']['relationship_type'],
                    ]);
                }
            }

            DB::commit();

            return back()->with('success', 'Profile updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Profile update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update profile.']);
        }
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', function ($attribute, $value, $fail) {
                if (!Hash::check($value, Auth::user()->password)) {
                    $fail('The provided password does not match your current password.');
                }
            }],
            'password' => ['required', 'confirmed', Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised()],
            'password_confirmation' => 'required'
        ]);

        try {
            DB::beginTransaction();
            
            $user = Auth::user();
            $user->update([
                'password' => Hash::make($request->password)
            ]);
            
            DB::commit();
            
            return back()->with('success', 'Password updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update password.']);
        }
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
        $file->storeAs('profiles', $fileName, 'public');
        
        return $fileName;
    }

    public function destroy(Request $request)
    {
        try {
            // Validate current password for security
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);

            $user = $request->user();
            
            // Delete profile image if exists
            $userRegistration = $user->registration;
            if ($userRegistration && $userRegistration->image) {
                if (Storage::exists('public/profiles/' . $userRegistration->image)) {
                    Storage::delete('public/profiles/' . $userRegistration->image);
                }
            }

            Auth::logout();

            $user->delete();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/')->with('status', 'Account deleted successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Account deletion error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete account. Please try again.']);
        }
    }
    
    public function updateContact(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Validate request data
            $validated = $request->validate([
                'email' => ['required', 'email', 'unique:users,email,'.$user->id],
                'phone' => ['required', 'string', 'max:15'],
            ]);

            DB::beginTransaction();

            // Update user email
            $user->update([
                'email' => $validated['email']
            ]);

            // Update user registration phone
            if ($user->registration) {
                $user->registration->update([
                    'tel_no' => $validated['phone']
                ]);

                // Update role-specific contact
                switch(strtolower($user->registration->role->role_name)) {
                    case 'admin':
                        $user->admin?->update(['contact_number' => $validated['phone']]);
                        break;
                    case 'teacher':
                        $user->teacher?->update(['contact_number' => $validated['phone']]);
                        break;
                    case 'student':
                        $user->student?->update(['contact_number' => $validated['phone']]);
                        break;
                }
            }

            DB::commit();

            return Inertia::render('Profile/Edit', [
                'status' => 'Contact information updated successfully',
                'user' => $user->fresh(['registration'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update contact information.']);
        }
    }
}