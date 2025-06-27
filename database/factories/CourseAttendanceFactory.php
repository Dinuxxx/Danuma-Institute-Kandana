<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CourseAttendance>
 */
class CourseAttendanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'status' => fake()->randomElement(['Present', 'Absebt']),
            'for_slot' => null, // will be set in seeder
            'att_id' => null,   // will be set in seeder
            'course_id' => null // will be set in seeder
        ];
    }
}
