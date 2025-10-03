<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class ReceptionistUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test receptionist user
        $receptionist = User::firstOrCreate(
            ['email' => 'receptionist@clinic.com'],
            [
                'name' => 'Lễ Tân Test',
                'password' => Hash::make('password123'),
            ]
        );

        // Assign receptionist role
        $receptionistRole = Role::where('name', 'receptionist')->first();
        if ($receptionistRole) {
            $receptionist->assignRole($receptionistRole);
        }
    }
}
