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
        
        // Validate the request
        $validated = $request->validate([             
            'current_password' => ['required', 'string'],             
            'password' => [
                'required', 
                'string', 
                'min:8', 
                'confirmed', 
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
                'different:current_password' // Ensure new password is different from current
            ],
            'password_confirmation' => ['required'],
        ], [             
            'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'password.different' => 'The new password must be different from your current password.'
        ]);

        // Validate the current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }
                  
        $user->password = Hash::make($validated['password']);
        $user->save();

        // Log the password change
        Log::info('Password changed for user:', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);
                  
        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully.'
        ]);
    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        // Log the error for debugging
        Log::error('Password update error: ' . $e->getMessage());
        
        // Return a proper error response
        return response()->json([
            'success' => false,
            'message' => 'Unable to update password',
            'error' => $e->getMessage()
        ], 500);
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
            
            // First, delete related records
            if ($user->registration) {
                $user->registration->delete();
            }
            
            // If there are other related records like admin, student, teacher, etc.
            if ($user->admin) {
                $user->admin->delete();
            }
            
            if ($user->student) {
                $user->student->delete();
            }
            
            if ($user->teacher) {
                $user->teacher->delete();
            }
            
            // Finally, delete the user
            $user->delete();
            
            // Logout the user
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully.'
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Account deletion error: ' . $e->getMessage());
            
            // Return a proper error response
            return response()->json([
                'success' => false,
                'message' => 'Unable to delete account',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}