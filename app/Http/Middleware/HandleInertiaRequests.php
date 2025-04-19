<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $userWithRole = null;
        
        if ($user) {
            // Load the user with their registration and role information
            $userWithRole = $user->load('registration.role');
            
            // Extract the role for easy access in the frontend
            $role = null;
            if ($userWithRole->registration && $userWithRole->registration->role) {
                $role = strtolower($userWithRole->registration->role->role_name);
            }
            
            // Add the role directly to the user object for easier access in React components
            $userWithRole->role = $role;
        }
        
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userWithRole,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }
}