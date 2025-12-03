<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AccountantUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create accountant user
        $accountant = User::firstOrCreate(
            ['email' => 'accountant@clinic.local'],
            [
                'name' => 'Nguyễn Thị Hoa',
                'email' => 'accountant@clinic.local',
                'password' => Hash::make('accountant123'),
                'email_verified_at' => now(),
            ]
        );

        // Assign accountant role
        $accountant->assignRole('accountant');
    }
}
