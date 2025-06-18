<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Role;
use App\Models\Admin;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        

        User::insert([
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123'),
                'remember_token' => Str::random(10),
            ],
            [
                'name' => 'Rushani',
                'email' => 'rushani@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123'),
                'remember_token' => Str::random(10),
            ],
            [
                'name' => 'Chamodi',
                'email' => 'chamodi@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123'),
                'remember_token' => Str::random(10),
            ],
            [
                'name' => 'Dinusha',
                'email' => 'dinusha@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123'),
                'remember_token' => Str::random(10),
            ],
            [
                'name' => 'Kishgi',
                'email' => 'kishgi@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123'),
                'remember_token' => Str::random(10),
            ],
            [
                'name' => 'Kaveesha',
                'email' => 'kaveesha@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123'),
                'remember_token' => Str::random(10),
            ],
            [
                'name' => 'Sudhesh',
                'email' => 'sudhesh@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123'),
                'remember_token' => Str::random(10),
            ],
            [
                'name' => 'Kavindu',
                'email' => 'kaindu@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123'),
                'remember_token' => Str::random(10),
            ],
        ]);

         \App\Models\User::factory()->count(100)->create(); 

         \App\Models\Admin::factory()->create([
            'salary' => fake()->numberBetween(50000, 120000),
            'nic' => fake()->unique()->regexify('[0-9]{9}[Vv]'),
            'user_id'=> 1,
         ]);

        $studentRoleId = Role::where('role_name', 'Student')->value('role_id');
        $teacherRoleId = Role::where('role_name', 'Teacher')->value('role_id');
         
        $allUsers= User::all();
        $index = 0;

        foreach ($allUsers as $user) {
            \App\Models\UserRegistration::factory()->create([
                'title' => fake()->title(),
                'first_name' => $user->name,
                'last_name' => fake()->lastName(),
                'gender' =>fake()->randomElement(['Male', 'Female']),
                'dob' => fake()->date(),
                'tel_no' => fake()->phoneNumber(),
                'address' => fake()->address(),
                'image' => null,
                'status' => 'active',
                'user_id' => $user->id,
                'role_id' => $index === 0 ? 1 : fake()->randomElement([$studentRoleId, $teacherRoleId]),
                'added_by' => 1,
            
            ]);

            $index++;

         \App\Models\LoginLog::factory()->count(20)->create();
        }

    }
}
