<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class RoleUserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Find the admin user
        $user = User::where('email', 'admin@clinic.local')->first();

        if ($user) {
            // Assign admin and doctor roles if they exist
            if (Role::where('name', 'admin')->exists()) {
                $user->assignRole('admin');
            }

            if (Role::where('name', 'doctor')->exists()) {
                $user->assignRole('doctor');
            }

            echo "Roles assigned to admin user\n";
        } else {
            echo "Admin user not found\n";
        }
    }
}
Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
    }
}
