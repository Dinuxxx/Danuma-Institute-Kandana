<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $index = 0;
        static $courseCombinations;

        if (!$courseCombinations) {
            $gradesOL = ['6', '7', '8', '9', '10', '11'];
            $gradesAL = ['12','13'];
            $subjectsOL = ['Sinhala', 'Tamil', 'English', 'Science', 'Maths', 'History'];
            $subjectsAL = ['Economics', 'Chemistry', 'Biology'];

            $combinations = [];

            foreach ($gradesOL as $grade) {
                foreach ($subjectsOL as $subject) {
                    $combinations[] = [$grade, $subject];
                }
            }

            foreach ($gradesAL as $grade) {
                foreach ($subjectsAL as $subject) {
                    $combinations[] = [$grade, $subject];
                }
            }

            $courseCombinations = $combinations;
        }

        if ($index >= count($courseCombinations)) {
            throw new \Exception("No more unique course combinations left in CourseFactory.");
        }

        [$grade, $subject] = $courseCombinations[$index++];
        // $courseId = strtoupper($grade . '-' . $subject . '-' . Str::random(5));
       

        return [
            // 'course_id' => $courseId,
            'course_name' => $subject . ' Grade ' . $grade,
            'monthly_fees' => $this->faker->randomFloat(2, 1000, 3000),
            'course_desc' => $this->faker->sentence(),
            'grade' => $grade,
            'subject' => $subject,
            'teacher_id' => null, // link later if teachers seeded
        ];
    }
}
