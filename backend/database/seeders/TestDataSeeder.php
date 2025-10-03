<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Patient;
use Spatie\Permission\Models\Role;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some test patients
        Patient::create([
            'name' => 'Nguyễn Văn Nam',
            'dob' => '1990-05-15',
            'phone' => '0901234567',
            'address' => '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
            'note' => 'Nhóm máu A+, Dị ứng: không'
        ]);

        Patient::create([
            'name' => 'Trần Thị Mai',
            'dob' => '1985-12-20',
            'phone' => '0912345678',
            'address' => '456 Đường DEF, Phường UVW, Quận 3, TP.HCM',
            'note' => 'Nhóm máu B+, Dị ứng: thuốc kháng sinh'
        ]);

        Patient::create([
            'name' => 'Lê Minh Tuấn',
            'dob' => '1995-08-10',
            'phone' => '0923456789',
            'address' => '789 Đường GHI, Phường RST, Quận 5, TP.HCM',
            'note' => 'Nhóm máu O+, Tiền sử: cao huyết áp'
        ]);
    }
}
