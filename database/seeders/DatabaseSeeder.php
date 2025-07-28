<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate tables (only the necessary ones)
        DB::table('users')->truncate();
        DB::table('roles')->truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Remove the factory calls since we're using seeders
        $this->call([
            RoleSeeder::class,    // First create roles
            AdminSeeder::class,   // Then create admin user
        ]);
    }
}

