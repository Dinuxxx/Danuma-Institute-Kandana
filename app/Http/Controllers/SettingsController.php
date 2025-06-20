<?php  

namespace App\Http\Controllers;  

use App\Models\User; 
use App\Models\UserRegistration; 
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth; 
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule; 
use Illuminate\Validation\ValidationException;
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
     * @return \Illuminate\Http\Response      
     */     
    public function updateAccount(Request $request)     
{
    DB::enableQueryLog(); // Enable query logging
    
    try {
        $user = Auth::user();                  
        
        Log::info('User data before update:', [
            'id' => $user->id,
            'current_name' => $user->name,
            'current_email' => $user->email
        ]);
        
        $validated = $request->validate([             
            'name' => ['required', 'string', 'max:255'],             
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],             
            'phone' => ['nullable', 'string', 'max:20'],         
        ]);                  
        
        Log::info('Validated data:', $validated);
        
        // Update users table
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();
        
        // Update user_registrations table
        $userRegistration = UserRegistration::where('user_id', $user->id)->first();
        
        if ($userRegistration) {
            // Only update phone if it's not null
            if (!is_null($validated['phone'])) {
                $userRegistration->tel_no = $validated['phone'];
                $userRegistration->save();
            }
        } else {
            // If no registration exists, create a new one
            UserRegistration::create([
                'user_id' => $user->id,
                'tel_no' => $validated['phone'] ?? '',
                'title' => '',
                'first_name' => $user->name,
                'last_name' => '',
                'gender' => '',
                'dob' => now(),
                'address' => '',
                'status' => 'active',
            ]);
        }
        
        // Log queries
        Log::info('Executed Queries:', DB::getQueryLog());
        
        return response()->json([
            'success' => true,
            'message' => 'Account information updated successfully.'
        ]);
    } catch (\Exception $e) {
        Log::error('Account update error: ' . $e->getMessage());
        Log::error('Trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Unable to update account information',
            'error' => $e->getMessage()
        ], 500);
    }
}    
    
    /**      
 * Update the user's password.      
 *      
 * @param  \Illuminate\Http\Request  $request      
 * @return \Illuminate\Http\Response      
 */     
public function updatePassword(Request $request)
    {
        try {
            $user = Auth::user();
            
            Log::info('Password update attempt for user:', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            // Validate the request with enhanced password rules
            $validated = $request->validate([
                'current_password' => ['required', 'string'],
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
                    'different:current_password'
                ],
                'password_confirmation' => ['required', 'string'],
            ], [
                'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
                'password.different' => 'The new password must be different from your current password.',
                'password.confirmed' => 'The password confirmation does not match.',
                'current_password.required' => 'Current password is required.',
            ]);

            // Verify the current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                Log::warning('Invalid current password provided for user:', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
                
                throw ValidationException::withMessages([
                    'current_password' => ['The current password is incorrect.'],
                ]);
            }

            // Check if new password is actually different from current
            if (Hash::check($validated['password'], $user->password)) {
                throw ValidationException::withMessages([
                    'password' => ['The new password must be different from your current password.'],
                ]);
            }

            // Use database transaction to ensure data consistency
            DB::transaction(function () use ($user, $validated) {
                // Hash and update the password
                $hashedPassword = Hash::make($validated['password']);
                
                // Update using both Eloquent and raw query for extra safety
                $user->password = $hashedPassword;
                $saved = $user->save();
                
                if (!$saved) {
                    throw new \Exception('Failed to save password to database');
                }
                
                // Double-check the password was actually updated
                $user->refresh();
                if (!Hash::check($validated['password'], $user->password)) {
                    throw new \Exception('Password verification failed after update');
                }
                
                Log::info('Password successfully updated for user:', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'updated_at' => $user->updated_at
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully.'
            ]);

        } catch (ValidationException $e) {
            Log::warning('Password update validation failed:', [
                'user_id' => Auth::id(),
                'errors' => $e->errors()
            ]);
            
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Password update error:', [
                'user_id' => Auth::id(),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unable to update password. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Verify current password (helper method for additional security)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function verifyCurrentPassword(Request $request)
    {
        try {
            $request->validate([
                'current_password' => ['required', 'string']
            ]);

            $user = Auth::user();
            $isValid = Hash::check($request->current_password, $user->password);

            return response()->json([
                'valid' => $isValid
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'error' => 'Verification failed'
            ], 400);
        }
    }   
    
    /**      
     * Update the user's appearance settings.      
     *      
     * @param  \Illuminate\Http\Request  $request      
     * @return \Illuminate\Http\Response      
     */     
    public function updateAppearance(Request $request)     
    {         
        try {
            $validated = $request->validate([
                'timezone' => ['required', 'string'],
                // Theme and language are commented out for now as mentioned in the requirements
                // 'theme' => ['required', 'string', 'in:light,dark,system'],             
                // 'language' => ['required', 'string', 'in:en,si,ta'],             
            ]);                  
            
            $user = Auth::user();
            
            // Store timezone preference
            // For now, we're assuming there's a preferences column in the user_registrations table
            // If not, you'd need to create a user_preferences table to store these settings
            if ($user->registration) {
                // We'll add a timezone field to the user_registration model
                // This requires a migration to add the timezone column if it doesn't exist
                $user->registration->timezone = $validated['timezone'];
                $user->registration->save();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Appearance settings updated successfully.'
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Appearance update error: ' . $e->getMessage());
            
            // Return a proper error response
            return response()->json([
                'success' => false,
                'message' => 'Unable to update appearance settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete the user's account.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function deleteAccount(Request $request)
    {
        try {
            $user = Auth::user();
            $userId = $user->id;
            
            Log::info('Starting account deletion process for user ID: ' . $userId);
            
            // Use database transaction to ensure data consistency
            DB::transaction(function () use ($user, $userId) {
                
                // 1. Delete student-related data if user is a student
                if ($user->student) {
                    $studentId = $user->student->student_id;
                    
                    // Delete exam marks
                    DB::table('exam_marks')->where('student_id', $studentId)->delete();
                    
                    // Delete student course registrations
                    DB::table('student_courses')->where('student_id', $studentId)->delete();
                    
                    // Delete payments related to student
                    DB::table('payments')->where('student_id', $studentId)->delete();
                    
                    // Delete attendance records for student
                    DB::table('attendances')->where('student_id', $studentId)->delete();
                    
                    // Delete the student record
                    $user->student->delete();
                    
                    Log::info('Deleted student-related data for student ID: ' . $studentId);
                }
                
                // 2. Delete teacher-related data if user is a teacher
                if ($user->teacher) {
                    $teacherId = $user->teacher->tea_id;
                    
                    // Update courses to remove teacher reference (set to null or reassign)
                    DB::table('courses')->where('teacher_id', $teacherId)->update(['teacher_id' => null]);
                    
                    // Delete the teacher record
                    $user->teacher->delete();
                    
                    Log::info('Deleted teacher-related data for teacher ID: ' . $teacherId);
                }
                
                // 3. Delete admin-related data if user is an admin
                if ($user->admin) {
                    $user->admin->delete();
                    Log::info('Deleted admin record for user ID: ' . $userId);
                }
                
                // 4. Delete records where user is referenced as "added_by"
                DB::table('user_registrations')->where('added_by', $userId)->update(['added_by' => null]);
                
                // 5. Delete records where user is referenced as "marked_by" in attendances
                DB::table('attendances')->where('marked_by', $userId)->update(['marked_by' => null]);
                
                // 6. Delete records where user is referenced as "verified_by" in payments
                DB::table('payments')->where('verified_by', $userId)->update(['verified_by' => null]);
                
                // 7. Delete login logs
                DB::table('login_logs')->where('user_id', $userId)->delete();
                
                // 8. Delete user registration record
                if ($user->registration) {
                    $user->registration->delete();
                    Log::info('Deleted user registration for user ID: ' . $userId);
                }
                
                // 9. Finally, delete the user account
                $user->delete();
                
                Log::info('Successfully deleted user account with ID: ' . $userId);
            });
            
            // Logout the user after successful deletion
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            // Redirect to login page with success message
            return redirect()->route('login')
                ->with('success', 'Your account has been successfully deleted.');
            
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Account deletion error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Redirect back with error message
            return back()->withErrors([
                'delete_account' => 'Unable to delete account. Please try again later.'
            ]);
        }
    }
    
    /**
     * Delete the user's account with password confirmation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function deleteAccountWithConfirmation(Request $request)
    {
        try {
            $validated = $request->validate([
                'password' => ['required', 'string'],
                'confirmation_text' => ['required', 'string', 'in:DELETE MY ACCOUNT'],
            ], [
                'confirmation_text.in' => 'Please type "DELETE MY ACCOUNT" to confirm deletion.'
            ]);
            
            $user = Auth::user();
            
            // Verify the password
            if (!Hash::check($validated['password'], $user->password)) {
                throw ValidationException::withMessages([
                    'password' => ['The password is incorrect.'],
                ]);
            }
            
            // If password is correct, proceed with account deletion
            return $this->deleteAccount($request);
            
        } catch (ValidationException $e) {
            throw $e; // Let Inertia handle validation errors
        } catch (\Exception $e) {
            Log::error('Account deletion confirmation error: ' . $e->getMessage());
            throw $e;
        }
    }
}