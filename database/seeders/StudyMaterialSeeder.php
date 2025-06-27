<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StudyMaterial;
use App\Models\Course;

class StudyMaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Loop through all courses and assign 1–5 materials each
        $courses = Course::all();

        foreach ($courses as $course) {
            StudyMaterial::factory()
                ->count(rand(1, 5))
                ->create([
                    'course_id' => $course->course_id,
                ]);
        }
    }
}
