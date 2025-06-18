<?php

namespace Database\Seeders;

use App\Models\Payment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
    
        \App\Models\Role::factory(4)->create();
        \App\Models\Module::factory(5)->create();
        
        $this->call(UserSeeder::class);

        $this->call(RoleModuleSeeder::class);

        $this->call(CourseSeeder::class);

        $this->call(StudentSeeder::class);

        $this->call(StudyMaterialSeeder::class);

        $this->call(ExamSeeder::class);
        
        $this->call(AttendanceSeeder::class);

        $this->call(PaymentSeeder::class);
    }
}
