<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,    // First create roles
            AdminSeeder::class,   // Then create admin user
            UserSeeder::class,    // Finally create other users
        ]);
    }
} 