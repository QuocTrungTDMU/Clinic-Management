<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class DoctorUserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create doctor user
        $doctorUser = User::firstOrCreate(
            ['email' => 'doctor@clinic.local'],
            [
                'name' => 'Dr. Smith',
                'password' => Hash::make('doctor123'),
                'email_verified_at' => now(),
            ]
        );

        // Assign doctor role
        if (Role::where('name', 'doctor')->exists()) {
            $doctorUser->syncRoles(['doctor']);
            echo "Doctor role assigned to doctor@clinic.local\n";
        }

        echo "Doctor user created: doctor@clinic.local / doctor123\n";
    }
}
