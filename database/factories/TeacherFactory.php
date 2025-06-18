<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Teacher>
 */
class TeacherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'salary' => $this->faker->numberBetween(50000, 120000),
            'qualifications' => $this->faker->sentence(),
            'nic' => $this->faker->unique()->regexify('[0-9]{9}[Vv]'),
            'user_id' => null, // set manually when calling
        ];
    }
}
