<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Module;

class RoleModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [

            // Admin: Full permissions on all modules
            'Admin' => [
                'CourseMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'AttendanceMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'PaymentMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'StudyMaterialMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'UserMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
            ],

            // Teacher: Limited access
            'Teacher' => [
                'CourseMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'AttendanceMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'PaymentMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'StudyMaterialMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'UserMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
            ],

            // Student: Mostly read-only
            'Student' => [
                'CourseMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'AttendanceMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'PaymentMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'StudyMaterialMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'UserMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
            ],

            // Developer: Only system modules
            'Developer' => [
                'CourseMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'AttendanceMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'PaymentMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'StudyMaterialMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
                'UserMgt' => ['can_view' => true, 'can_edit' => true, 'can_delete' => true, 'can_create' => true],
            ],
        ];

        foreach ($permissions as $roleName => $modules) {
            $role = Role::where('role_name', $roleName)->first();
            foreach ($modules as $moduleName => $perm) {
                $module = Module::where('module_name', $moduleName)->first();
                if ($role && $module) {
                    $role->modules()->attach($module->module_id, $perm);
                }
            }
        }
    }
}
