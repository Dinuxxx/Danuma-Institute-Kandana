<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudentCourse>
 */
class StudentCourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'registered_date_time' => fake()->dateTimeBetween('-1 years', 'now'),
            'status' => fake()->randomElement(['active', 'completed', 'dropped']),
            'student_id' => 1, // override in seeder
            'course_id' => 1,  // override in seeder
        ];
    }
}
