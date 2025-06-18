<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Parents>
 */
class ParentsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'parent_first_name' => fake()->firstName(),
            'parent_last_name' => fake()->lastName(),
            'parent_phone_number' => fake()->numerify('0#########'),
            'relationship_type' => fake()->randomElement(['Father', 'Mother', 'Guardian']),
        ];
    }
}
