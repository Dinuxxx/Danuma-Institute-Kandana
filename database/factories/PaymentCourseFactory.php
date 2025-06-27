<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaymentCourse>
 */
class PaymentCourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'month' => $this->faker->monthName,
            'amount' => $this->faker->randomFloat(2, 500, 2000),
            'status' => $this->faker->randomElement(['Paid', 'Pending']),
        ];
    }
}
