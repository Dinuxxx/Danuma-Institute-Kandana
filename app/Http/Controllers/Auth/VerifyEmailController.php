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
        $role = optional($user->registration)->role->role_name ?? null;
        if ($role) {
            $role = strtolower($role);
            if ($role === 'student') {
                return redirect()->route('student.dashboard');
            } elseif ($role === 'teacher') {
                return redirect()->route('teacher.dashboard');
            } elseif ($role === 'admin') {
                return redirect()->route('admin.dashboard');
            }
        }
        return redirect()->route('dashboard');
    }
}
