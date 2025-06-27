<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudyMaterials>
 */
class StudyMaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'material_title' => fake()->sentence(3),
            'material_desc' => fake()->paragraph(),
            'material_path' => 'uploads/' . fake()->uuid . '.pdf',
            'original_filename' => fake()->word . '.pdf',
            'material_url' => fake()->optional()->url(),
            'material_url_title' => fake()->optional()->sentence(2),
            'is_visible' => fake()->boolean(90), // 90% visible
            'course_id' => null, // assigned in seeder
        ];
    }
}
