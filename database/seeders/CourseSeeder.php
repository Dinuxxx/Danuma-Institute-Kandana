<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\TimeTables;
use App\Models\Role;
use App\Models\Teacher;
use App\Models\UserRegistration;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //  Get teacher role ID and user IDs
        $teacherRoleId = Role::where('role_name', 'Teacher')->value('role_id');
        $teacherUsers = UserRegistration::where('role_id', $teacherRoleId)->pluck('user_id');

        $courses = Course::factory()->count(42)->create();

        //  Create timetables for each course
        foreach ($courses as $course) {
            
            TimeTables::factory()->count(rand(1, 3))->create([
                'course_id' => $course->course_id,
            ]);
        }

        //  Create teacher records and assign courses
        foreach ($teacherUsers as $userId) {
            $teacher = Teacher::factory()->create([
                'user_id' => $userId,
            ]);

            // Assign 1 to 3 unassigned courses to this teacher
            $assignedCourses = Course::whereNull('teacher_id')
                ->inRandomOrder()
                ->take(rand(1, 3))
                ->get();

            foreach ($assignedCourses as $course) {
                $course->update(['teacher_id' => $teacher->tea_id]);
            }
        }
    }

}
