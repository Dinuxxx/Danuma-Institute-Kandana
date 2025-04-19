<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectAfterLogin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (Auth::check()) {
            $user = Auth::user();
            $userRegistration = $user->registration;
            
            if ($userRegistration && $userRegistration->role) {
                $userRole = strtolower($userRegistration->role->role_name);
                
                if (in_array($request->path(), ['/', 'login'])) {
                    // Redirect based on role
                    if ($userRole === 'admin') {
                        return redirect('/admin/dashboard');
                    } elseif ($userRole === 'teacher') {
                        return redirect('/teacher/dashboard');
                    } elseif ($userRole === 'student') {
                        return redirect('/student/dashboard');
                    }
                }
            }
        }

        return $next($request);
    }
}