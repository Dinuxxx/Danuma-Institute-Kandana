<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\UserRegistration;
use App\Models\Admin;
use App\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create the base user
        $user = User::create([
            'name' => 'Admin User',
            'email' => 'admin2@danuma.com',
            'password' => Hash::make('admin123'),
            'email_verified_at' => now(),
        ]);

        // Get the admin role ID
        $adminRole = Role::where('role_name', 'admin')->first();
        if (!$adminRole) {
            throw new \Exception('Admin role not found in the database');
        }

        // Create user registration
        $registration = UserRegistration::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'gender' => 'Male',
            'dob' => '1990-01-01',
            'tel_no' => '0771234567',
            'address' => 'Danuma Institute, Kandana',
            'status' => 1,
            'user_id' => $user->id,
            'role_id' => $adminRole->role_id,
            'added_by' => $user->id, // Self-added
        ]);

        // Create admin record
        Admin::create([
            'user_id' => $user->id,
            'salary' => 50000,
            'nic' => '901234567V',
        ]);
    }
}