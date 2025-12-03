<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class LabTechnicianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create lab_technician role if not exists
        $role = Role::firstOrCreate(['name' => 'lab_technician']);

        // Create a lab technician user
        $labTechnician = User::firstOrCreate(
            ['email' => 'lab@clinic.com'],
            [
                'name' => 'Lab Technician',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign role
        if (!$labTechnician->hasRole('lab_technician')) {
            $labTechnician->assignRole($role);
        }

        $this->command->info('Lab Technician user created successfully!');
        $this->command->info('Email: lab@clinic.com');
        $this->command->info('Password: password');
    }
}
