<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\Payment;
use App\Models\PaymentCourse;
use App\Models\Course;
use App\Models\User;
use App\Models\Role;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminId = Role::where('role_name', 'Admin')->value('role_id');
        
        $students = Student::with('courses')->get();

        foreach ($students as $student) {
            if ($student->courses->isEmpty()) continue;

            // Each student can make 1-3 payments
            for ($i = 0; $i < rand(1, 3); $i++) {
                $payment = Payment::factory()->create([
                    'student_id' => $student->student_id,
                    'verified_by' => $adminId,
                ]);

                // This payment pays for 1-2 of their enrolled courses
                $enrolledCourses = $student->courses->random(rand(1, min(2, $student->courses->count())));

                foreach ($enrolledCourses as $course) {
                    // For each course, 1-2 months
                    for ($j = 0; $j < rand(1, 2); $j++) {
                        PaymentCourse::factory()->create([
                            'payment_id' => $payment->payment_id,
                            'course_id' => $course->course_id,
                        ]);
                    }
                }
            }
        }
    }
}
