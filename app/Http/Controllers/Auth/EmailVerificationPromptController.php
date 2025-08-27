<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        $user = $request->user();
        
        if ($user->hasVerifiedEmail()) {
            return $this->redirectBasedOnRole($user);
        }
        
        return Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }
    
    /**
     * Redirect user to appropriate dashboard based on their role
     */
    private function redirectBasedOnRole($user): RedirectResponse
    {
        try {
            $role = $user->role->role_name ?? 'student';
            Log::info('User redirect after verification prompt', [
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
