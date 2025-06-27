<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['role_name' => 'admin', 'role_status' => 'active'],
            ['role_name' => 'teacher', 'role_status' => 'active'],
            ['role_name' => 'student', 'role_status' => 'active'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate($role);
        }

        DB::table('roles')->updateOrInsert(
            ['role_id' => 1],
            ['role_name' => 'admin', 'role_status' => 'active']
        );
        DB::table('roles')->updateOrInsert(
            ['role_id' => 2],
            ['role_name' => 'teacher', 'role_status' => 'active']
        );
        DB::table('roles')->updateOrInsert(
            ['role_id' => 3],
            ['role_name' => 'student', 'role_status' => 'active']
        );
    }
} 