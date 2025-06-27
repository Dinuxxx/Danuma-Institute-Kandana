<?php

namespace Database\Seeders;


use App\Models\Payment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {
  \App\Models\Role::factory(4)->create();
        \App\Models\Module::factory(5)->create();
  
        $this->call([
            RoleSeeder::class,    // First create roles
            AdminSeeder::class,   // Then create admin user
            UserSeeder::class, 
            RoleModuleSeeder::class,
            CourseSeeder::class,
            StudentSeeder::class,
            StudyMaterialSeeder::class,
            ExamSeeder::class,
            AttendanceSeeder::class,
            PaymentSeeder::class,// Finally create other users
        ]);
    }
} 

