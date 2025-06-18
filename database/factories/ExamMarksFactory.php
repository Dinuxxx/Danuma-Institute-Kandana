<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExamMarks>
 */
class ExamMarksFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'marks' => fake()->randomFloat(2, 0, 100),
            'exam_id' => null,   // override in seeder
            'student_id' => null,
        ];
    }
}
