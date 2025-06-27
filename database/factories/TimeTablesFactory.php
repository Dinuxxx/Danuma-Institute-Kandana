<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TimeTables>
 */
class TimeTablesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
         return [
            'day_of_week' => $this->faker->dayOfWeek(),
            'start_time' => $this->faker->time('H:i', '17:00'),
            'end_time' => $this->faker->time('H:i', '20:00'),
             'course_id' => null, // filled when assigning
            'classroom_no' => 'CR-' . $this->faker->numberBetween(1, 10),
        ];
    }
}
