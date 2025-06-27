<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attendance>
 */
class AttendanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = fake()->dateTimeBetween('-30 days', 'now');
        $checkIn = fake()->dateTimeBetween($date->format('Y-m-d') . ' 07:00:00', $date->format('Y-m-d') . ' 10:00:00');
        $checkOut = (clone $checkIn)->modify('+4 hours');

        return [
            'check_in_time' => $checkIn,
            'check_out_time' => $checkOut,
            'date' => $date->format('Y-m-d'),
            'marked_method' => $this->faker->randomElement(['Manual', 'QR']),
            'marked_by' => 1, // Always admin
            'student_id' => null, // Will be filled manually in seeder
        ];
    }
}
