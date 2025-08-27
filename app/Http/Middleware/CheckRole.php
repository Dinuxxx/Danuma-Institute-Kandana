<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!Auth::check()) {
            Log::info('CheckRole: User not authenticated');
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        Log::info('CheckRole middleware check', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'required_role' => $role,
            'user_role' => $user->role ? $user->role->role_name : 'No role',
            'request_url' => $request->url()
        ]);
        
        try {
            // Check if user has the required role
            if (!$user->role || strtolower($user->role->role_name) !== strtolower($role)) {
                Log::warning('User access denied - insufficient role', [
                    'user_id' => $user->id,
                    'user_role' => $user->role->role_name ?? 'none',
                    'required_role' => $role,
                    'requested_url' => $request->url()
                ]);
                
                // Redirect based on user's actual role
                if ($user->role) {
                    switch (strtolower($user->role->role_name)) {
                        case 'admin':
                            return redirect()->route('admin.dashboard');
                        case 'teacher':
                            return redirect()->route('teacher.dashboard');
                        case 'student':
                            return redirect()->route('student.dashboard');
                        default:
                            return redirect()->route('dashboard');
                    }
                }
                
                return redirect()->route('dashboard');
            }
            
            Log::info('CheckRole: Access granted', [
                'user_id' => $user->id,
                'role' => $role
            ]);
            
            return $next($request);
            
        } catch (\Exception $e) {
            Log::error('Error in CheckRole middleware: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->route('dashboard');
        }
    }
}