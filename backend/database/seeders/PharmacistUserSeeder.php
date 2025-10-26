<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class PharmacistUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create pharmacist role if not exists
        $pharmacistRole = Role::firstOrCreate(['name' => 'pharmacist']);

        // Create pharmacist user
        $pharmacist = User::firstOrCreate(
            ['email' => 'pharmacist@clinic.local'],
            [
                'name' => 'Dược Sĩ Test',
                'password' => Hash::make('pharmacist123'),
            ]
        );

        // Assign role
        if (!$pharmacist->hasRole('pharmacist')) {
            $pharmacist->assignRole($pharmacistRole);
        }

        $this->command->info('✅ Pharmacist user created: pharmacist@clinic.local / pharmacist123');
    }
}
