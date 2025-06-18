<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payments>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'method' => $this->faker->randomElement(['Online Transfer', 'Bank Deposit', 'Manual']),
            'status' => 'Verified', 
            'amount' => $this->faker->randomFloat(2, 1000, 5000),
            'proof_path' => $this->faker->imageUrl(),
        ];
    }
}
