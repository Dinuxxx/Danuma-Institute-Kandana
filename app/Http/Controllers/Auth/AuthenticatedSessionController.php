<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();
        
        // Remove automatic verification email sending
        // Verification email will only be sent when user clicks "Resend Verification Email" button
        
        // Redirect based on user role
        return $this->redirectBasedOnRole($user);
    }

    /**
     * Redirect user to appropriate dashboard based on their role
     */
    private function redirectBasedOnRole($user): RedirectResponse
    {
        try {
            $role = $user->role->role_name ?? 'student';
            Log::info('User login redirect', [
                'user_id' => $user->id,
                'role' => $role
            ]);

            switch (strtolower($role)) {
                case 'admin':
                    return redirect()->route('admin.dashboard');
                case 'teacher':
                    return redirect()->route('teacher.dashboard');
                case 'student':
                    return redirect()->route('student.dashboard');
                default:
                    return redirect()->route('dashboard');
            }
        } catch (\Exception $e) {
            Log::error('Error determining user role for redirect: ' . $e->getMessage(), [
                'user_id' => $user->id
            ]);
            return redirect()->route('dashboard');
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
