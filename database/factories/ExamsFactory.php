<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Exams>
 */
class ExamsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'exam_name' => fake()->randomElement(['Midterm', 'Final', 'Quiz', 'Assignment']) . ' Exam',
            'exam_date' => fake()->dateTimeBetween('-1 year', '+1 month'),
            'status' => fake()->randomElement(['Scheduled', 'Completed']),
            'course_id' => null, // override in seeder
        ];
    }
}
