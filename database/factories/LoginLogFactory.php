<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LoginLog>
 */
class LoginLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $loginTime = $this->faker->dateTimeBetween('-1 month', 'now');
        $logoutTime = (clone $loginTime)->modify('+'.rand(1, 5).' hours');

        return [
            'login_date_time' => $loginTime,
            'logout_date_time' => $this->faker->boolean(80) ? $logoutTime : null, // 80% have logout
            'log_ip' => fake()->ipv4,
            'log_status' => fake()->randomElement(['Success', 'Failed', 'Timeout']),
            'user_id' => User::inRandomOrder()->value('id') // assign random user
        ];
    }
}
