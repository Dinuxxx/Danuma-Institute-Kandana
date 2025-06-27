<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\UserRegistration;
use App\Models\Course;
use App\Models\Parents;
use App\Models\QRCodes;
use App\Models\Student;
use App\Models\StudentCourse;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        
        // Get role_id for 'Student' from roles table
        $studentRoleId = Role::where('role_name', 'Student')->value('role_id');

        if (!$studentRoleId) {
            $this->command->error("Student role not found. Please create it first.");
            return;
        }

        // Get all users with 'Student' role from user_registrations table
        $studentUserIds = UserRegistration::where('role_id', $studentRoleId)->pluck('user_id');

        if ($studentUserIds->isEmpty()) {
            $this->command->info("No users with Student role found.");
            return;
        }

        // Fetch all courses once for assignment
        $courses = Course::all();

        foreach ($studentUserIds as $userId) {

            // Create Parent record
            $parent = Parents::factory()->create();

            // Create QRCode record
            $qrCode = QRCodes::factory()->create();

            // Create Student record linked to User, Parent, QRCode
            $student = Student::factory()->create([
                'user_id' => $userId,
                'parent_id' => $parent->parent_id,
                'QR_id' => $qrCode->QR_id,
            ]);

            // Assign 1 to 4 random courses to student
            $assignedCourses = $courses->random(rand(1, 4));

            foreach ($assignedCourses as $course) {
                StudentCourse::create([
                    'student_id' => $student->student_id,
                    'course_id' => $course->course_id,
                    'registered_date_time' => now(),
                    'status' => 'active',
                ]);
            }

            // $this->command->info("Seeded student with user_id $userId, parent_id {$parent->parent_id}, QR_id {$qrCode->QR_id}");
        }
    }
}
