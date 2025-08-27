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
                // Use the User model's role relationship
                if (!$user->role) {
                    Log::warning('User role not found', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                    return redirect()->route('dashboard');
                }
                
                $roleName = strtolower($user->role->role_name);
                Log::info('User login redirect', [
                    'user_id' => $user->id,
                    'role' => $roleName
                ]);
                
                // Redirect based on user role
                switch ($roleName) {
                    case 'admin':
                        return redirect()->route('admin.dashboard');
                        
                    case 'teacher':
                        return redirect()->route('teacher.dashboard');
                        
                    case 'student':
                        return redirect()->route('student.dashboard');
                        
                    default:
                        Log::warning('Unknown user role detected', [
                            'user_id' => $user->id,
                            'role_name' => $user->role->role_name
                        ]);
                        return redirect()->route('dashboard');
                }
                
            } catch (\Exception $e) {
                Log::error('Error determining user role for redirect', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $e->getMessage()
                ]);
                
                return redirect()->route('dashboard');
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