<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Exams;
use App\Models\ExamMarks;
use App\Models\StudentCourse;

class ExamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = Course::all();

        foreach ($courses as $course) {
            // Create 1 to 3 exams per course
            $exams = Exams::factory()->count(rand(1, 3))->create([
                'course_id' => $course->course_id,
            ]);

            // Get all students enrolled in this course
            $studentIds = StudentCourse::where('course_id', $course->course_id)->pluck('student_id');

            foreach ($exams as $exam) {
                foreach ($studentIds as $studentId) {
                    ExamMarks::create([
                        'exam_id' => $exam->exam_id,
                        'student_id' => $studentId,
                        'marks' => $exam->status === 'Scheduled'
                            ? null
                            : fake()->randomFloat(2, 0, 100),
                    ]);
                }
            }
        }
    }
}
