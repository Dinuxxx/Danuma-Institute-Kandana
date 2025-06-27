<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Module>
 */
class ModuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    
    protected static $modules = [
        ['module_name' => 'CourseMgt', 'module_status' => 'active', 'module_image' => null, 'module_desc' => 'Course Management'],
        ['module_name' => 'AttendanceMgt', 'module_status' => 'active', 'module_image' => null, 'module_desc' => 'Attendance Tracking'],
        ['module_name' => 'PaymentMgt', 'module_status' => 'active', 'module_image' => null, 'module_desc' => 'Payment Handling'],
        ['module_name' => 'StudyMaterialMgt', 'module_status' => 'active', 'module_image' => null, 'module_desc' => 'Materials Upload/Download'],
        ['module_name' => 'UserMgt', 'module_status' => 'active', 'module_image' => null, 'module_desc' => 'User Registration & Roles'],
    ];

     public function definition(): array
    {
        $module = array_shift(self::$modules); // pick in order
        return $module;
    }
}
