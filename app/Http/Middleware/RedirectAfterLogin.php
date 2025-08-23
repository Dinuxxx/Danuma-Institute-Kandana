<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\UserRegistration;
use App\Models\Role;
use Illuminate\Support\Facades\Log;

class RedirectAfterLogin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only redirect authenticated users from / or /login to the appropriate dashboard
        if (in_array($request->path(), ['/', 'login']) && Auth::check()) {
            $user = Auth::user();
            
            try {
                // Get user role from user_registrations table
                $userRegistration = UserRegistration::where('user_id', $user->id)->first();
                
                if (!$userRegistration) {
                    Log::warning('User registration not found for authenticated user', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                    // Default to admin dashboard if no registration found
                    return redirect()->route('admin.dashboard');
                }
                
                // Get role information
                $role = Role::find($userRegistration->role_id);
                
                if (!$role) {
                    Log::warning('Role not found for user registration', [
                        'user_id' => $user->id,
                        'role_id' => $userRegistration->role_id
                    ]);
                    // Default to admin dashboard if role not found
                    return redirect()->route('admin.dashboard');
                }
                
                // Redirect based on user role (case-insensitive comparison)
                switch (strtolower($role->role_name)) {
                    case 'admin':
                        return redirect()->route('admin.dashboard');
                        
                    case 'teacher':
                        return redirect()->route('teacher.dashboard');
                        
                    case 'student':
                        return redirect()->route('student.dashboard');
                        
                    default:
                        // Log unknown role and default to admin dashboard
                        Log::warning('Unknown user role detected', [
                            'user_id' => $user->id,
                            'role_name' => $role->role_name,
                            'role_id' => $role->role_id
                        ]);
                        return redirect()->route('admin.dashboard');
                }
                
            } catch (\Exception $e) {
                // Log the error and default to admin dashboard
                Log::error('Error determining user role for redirect', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return redirect()->route('admin.dashboard');
            }
        }

        return $next($request);
    }
    
    /**
     * Alternative method using direct role checking if you have role stored in users table
     * Uncomment this method and comment the above if you prefer this approach
     */
    /*
    public function handle(Request $request, Closure $next): Response
    {
        // Only redirect authenticated users from / or /login to the appropriate dashboard
        if (in_array($request->path(), ['/', 'login']) && Auth::check()) {
            $user = Auth::user();
            
            // Check if user has a direct role field in users table
            if (isset($user->role)) {
                switch (strtolower($user->role)) {
                    case 'admin':
                        return redirect()->route('admin.dashboard');
                        
                    case 'teacher':
                        return redirect()->route('teacher.dashboard');
                        
                    case 'student':
                        return redirect()->route('student.dashboard');
                        
                    default:
                        // Default to admin dashboard for unknown roles
                        return redirect()->route('admin.dashboard');
                }
            }
            
            // Fallback to admin dashboard if no role found
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
    */
}