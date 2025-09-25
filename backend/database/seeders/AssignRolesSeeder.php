<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AssignRolesSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Find the admin user
        $user = User::where('email', 'admin@clinic.local')->first();

        if ($user) {
            // Remove existing roles first
            $user->syncRoles([]);

            // Assign admin and doctor roles if they exist
            if (Role::where('name', 'admin')->exists()) {
                $user->assignRole('admin');
                echo "Admin role assigned\n";
            }

            if (Role::where('name', 'doctor')->exists()) {
                $user->assignRole('doctor');
                echo "Doctor role assigned\n";
            }

            echo "Roles assigned to admin user\n";
        } else {
            echo "Admin user not found\n";
        }
    }
}
