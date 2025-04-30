<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

class CheckRole
{
  /**
   * Handle an incoming request.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next, string $role): Response
  {
      // Check if user is authenticated
      if (!Auth::check()) {
          return redirect()->route('login');
      }

      // Get the user's role from registration
      $user = Auth::user();
      $userRegistration = $user->registration;
      
      if (!$userRegistration || !$userRegistration->role) {
          return redirect()->route('login')->with('error', 'Role not assigned. Please contact administrator.');
      }

      $userRole = strtolower($userRegistration->role->role_name);

      // Check if the user has the required role
      if ($userRole !== strtolower($role)) {
          // Redirect to appropriate dashboard based on role
          if ($userRole === 'admin') {
              return redirect('/admin/dashboard');
          } elseif ($userRole === 'teacher') {
              return redirect('/teacher/dashboard');
          } elseif ($userRole === 'student') {
              return redirect('/student/dashboard');
          } else {
              return redirect()->route('login');
          }
      }

      return $next($request);
  }
}