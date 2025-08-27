<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        if ($user->hasVerifiedEmail()) {
            return $this->redirectBasedOnRole($user);
        }

        try {
            $user->sendEmailVerificationNotification();
            
            Log::info('Verification email sent manually', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'role' => $user->role->role_name ?? 'unknown'
            ]);
            
            return back()->with('status', 'verification-link-sent');
            
        } catch (\Exception $e) {
            Log::error('Failed to send verification email: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'error' => $e->getMessage()
            ]);
            
            return back()->with('error', 'Failed to send verification email. Please try again.');
        }
    }
    
    /**
     * Redirect user to appropriate dashboard based on their role
     */
    private function redirectBasedOnRole($user): RedirectResponse
    {
        try {
            $role = $user->role->role_name ?? 'student';
            Log::info('User redirect after verification', [
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
}
