<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create roles with specific IDs if they don't exist
        $roles = [
            ['id' => 1, 'name' => 'admin', 'guard_name' => 'web'],
            ['id' => 2, 'name' => 'doctor', 'guard_name' => 'web'],
            ['id' => 3, 'name' => 'nurse', 'guard_name' => 'web'],
            ['id' => 4, 'name' => 'receptionist', 'guard_name' => 'web'],
            ['id' => 5, 'name' => 'pharmacist', 'guard_name' => 'web'],
        ];

        foreach ($roles as $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleData['name'], 'guard_name' => $roleData['guard_name']],
                $roleData
            );
            echo "Role: {$role->name} - ID: {$role->id}\n";
        }
    }
}
