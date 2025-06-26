<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\UserRegistration;
use App\Models\Admin;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Start a database transaction
        DB::beginTransaction();

        try {
            // First, ensure the admin role exists
            $adminRole = Role::firstOrCreate(
                ['role_name' => 'admin'],
                ['role_status' => 'active']
            );

            // Create the base user
            $user = User::updateOrCreate(
                ['email' => 'admin@danuma.com'],
                [
                    'name' => 'Admin User',
                    'password' => Hash::make('admin123'),
                    'email_verified_at' => now(),
                ]
            );

            // Create user registration with role
            $registration = UserRegistration::updateOrCreate(
                ['user_id' => $user->id],
                [

                    'first_name' => 'Admin',
                    'last_name' => 'User',
                    'gender' => 'Male',
                    'dob' => '1990-01-01',
                    'tel_no' => '0771234567',
                    'address' => 'Danuma Institute, Kandana',
                    'status' => 'active',
                    'role_id' => $adminRole->role_id,
                    'added_by' => $user->id, // Self-added
                ]
            );

            // Create admin record
            Admin::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'salary' => 50000,
                    'nic' => '901234567V',
                ]
            );

            // If everything is successful, commit the transaction
            DB::commit();
            
            $this->command->info('Admin user created successfully with all required records.');
            
        } catch (\Exception $e) {
            // If there's an error, rollback the transaction
            DB::rollBack();
            $this->command->error('Error creating admin user: ' . $e->getMessage());
            throw $e;
        }
    }
} 