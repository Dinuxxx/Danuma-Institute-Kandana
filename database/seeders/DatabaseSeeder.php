<?php

namespace Database\Seeders;


use App\Models\Payment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate tables
        DB::table('users')->truncate();
        DB::table('roles')->truncate();
        DB::table('modules')->truncate();
        // Add other tables as needed...

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

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

