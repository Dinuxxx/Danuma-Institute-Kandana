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
                
                // Add registration ID and join date for admin
                if ($roleSpecificData) {
                    $roleSpecificData->admin_id = $userRegistration->registration_id;
                    $roleSpecificData->created_at = $userRegistration->created_at;
                }
            } elseif ($userRole === 'teacher') {
                $roleSpecificData = Teacher::where('user_id', $user->id)->first();
                
                // Add teacher registration ID and join date
                if ($userRegistration) {
                    $roleSpecificData->teacher_id = $userRegistration->registration_id; // Use registration_id as teacher_id
                    $roleSpecificData->created_at = $userRegistration->created_at;
                }
                
                // Get teacher's courses with students count and timetables - ensure timetables are loaded
                if ($roleSpecificData) {
                    // Use eager loading to get courses with related data
                    $courses = $roleSpecificData->courses()
                        ->with(['students', 'timeTables']) // Make sure timeTables relationship is loaded
                        ->get();
                    
                    // Debug logging to verify timetables data
                    \Log::debug('Teacher courses with timetables:', [
                        'teacher_id' => $roleSpecificData->tea_id,
                        'courses_count' => $courses->count(),
                        'first_course_timetables' => $courses->first() ? $courses->first()->timeTables->toArray() : 'No courses'
                    ]);
                    
                    // Add students count to each course
                    $courses = $courses->map(function($course) {
                        $course->students_count = $course->students->count();
                        
                        // Make sure timeTables is accessible as a property
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
                            'status' => $course->pivot->status // Get status from pivot table
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
            'title' => 'required|string|max:10',
            'first_name' => 'required|string|max:250',
            'last_name' => 'required|string|max:250',
            'tel_no' => 'required|string|max:25',
            'address' => 'required|string',
        ]);
        
        // Update user email
        $user->email = $validated['email'];
        $user->save();
        
        // Only update registration details if we have a registration record
        if ($userRegistration) {
            // Handle profile image upload
            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                $fileName = $this->handleImageUpload($request, $userRegistration);
                
                // Update user registration with new image
                $userRegistration->update([
                    'title' => $validated['title'],
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'tel_no' => $validated['tel_no'],
                    'address' => $validated['address'],
                    'image' => $fileName
                ]);
            } else {
                // Update user registration without changing image
                $userRegistration->update([
                    'title' => $validated['title'],
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'tel_no' => $validated['tel_no'],
                    'address' => $validated['address'],
                ]);
            }
            
            // Handle role-specific updates if role exists
            if ($userRegistration->role) {
                $userRole = strtolower($userRegistration->role->role_name);
                
                if ($userRole === 'admin') {
                    // Validate admin-specific fields
                    $adminValidated = $request->validate([
                        'nic' => 'required|string|max:25',
                    ]);
                    
                    // Update admin data
                    Admin::updateOrCreate(
                        ['user_id' => $user->id],
                        ['nic' => $adminValidated['nic']]
                    );
                } elseif ($userRole === 'teacher') {
                    if ($request->has('nic') && $request->has('qualifications')) {
                        Teacher::where('user_id', $user->id)->update([
                            'nic' => $request->nic,
                            'qualifications' => $request->qualifications,
                        ]);
                    }
                } elseif ($userRole === 'student') {
                    if ($request->has('parent_info')) {
                        $studentModel = Student::where('user_id', $user->id)->first();
                        
                        if ($studentModel && $studentModel->parent_id) {
                            // Get parent model
                            $parent = $studentModel->parent;
                            
                            // Update with the correct field names
                            $parent->update([
                                'parent_first_name' => $request->parent_info['first_name'],
                                'parent_last_name' => $request->parent_info['last_name'],
                                'parent_phone_number' => $request->parent_info['tel_no'],
                                'relationship_type' => $request->parent_info['relationship_type']
                            ]);
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
        $file->storeAs('profiles', $fileName, 'public');
        
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