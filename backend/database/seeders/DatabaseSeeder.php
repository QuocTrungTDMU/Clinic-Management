<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndAdminSeeder::class,
            DoctorUserSeeder::class,
            ReceptionistUserSeeder::class,
            PharmacistUserSeeder::class,
            LabTechnicianSeeder::class,
            AccountantUserSeeder::class,
            ICD10Seeder::class,
            LabTestTypeSeeder::class,
            MedicineSeeder::class,
        ]);
    }
}
