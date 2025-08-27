<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if (!$request->user()) {
            // If not authenticated, redirect to login
            return redirect()->route('login')->with('message', 'Please log in to verify your email.');
        }

        if ($request->user()->hasVerifiedEmail()) {
            return $this->redirectByRole($request->user());
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        session()->flash('verified', true);

        return $this->redirectByRole($request->user());
    }

    private function redirectByRole($user)
    {
        try {
            $role = $user->role->role_name ?? null;
            if ($role) {
                $role = strtolower($role);
                switch ($role) {
                    case 'student':
                        return redirect()->route('student.dashboard');
                    case 'teacher':
                        return redirect()->route('teacher.dashboard');
                    case 'admin':
                        return redirect()->route('admin.dashboard');
                    default:
                        return redirect()->route('dashboard');
                }
            }
            return redirect()->route('dashboard');
        } catch (\Exception $e) {
            // Log error and redirect to default dashboard
            \Log::error('Error in redirectByRole: ' . $e->getMessage(), [
                'user_id' => $user->id
            ]);
            return redirect()->route('dashboard');
        }
    }
}
