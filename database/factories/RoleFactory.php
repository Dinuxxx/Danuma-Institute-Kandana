<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    
    protected static $roles = [
        ['role_name' => 'Admin', 'role_desc' => 'Full access to all modules', 'role_status' => 'active'],
        ['role_name' => 'Teacher', 'role_desc' => 'Handles classes and exams', 'role_status' => 'active'],
        ['role_name' => 'Student', 'role_desc' => 'Learns and submits assignments', 'role_status' => 'active'],
        ['role_name' => 'Developer', 'role_desc' => 'System developer and maintenance', 'role_status' => 'active'],
    ];

     public function definition(): array
    {
        $role = array_shift(self::$roles); // get one and remove it from array
        return $role;

    }
}
