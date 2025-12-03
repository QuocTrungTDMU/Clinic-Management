<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

// Ensure doctor role exists
$doctorRole = Role::firstOrCreate(['name' => 'doctor']);

$doctors = [
    [
        'name' => 'BS. Nguyễn Văn An',
        'email' => 'bs.noi@clinic.com',
        'specialization' => 'internal', // Nội khoa
    ],
    [
        'name' => 'BS. Trần Thị Bình',
        'email' => 'bs.ngoai@clinic.com',
        'specialization' => 'surgery', // Ngoại khoa
    ],
    [
        'name' => 'BS. Lê Văn Cường',
        'email' => 'bs.nhi@clinic.com',
        'specialization' => 'pediatrics', // Nhi khoa
    ],
    [
        'name' => 'BS. Phạm Thị Dung',
        'email' => 'bs.san@clinic.com',
        'specialization' => 'obstetrics', // Sản khoa
    ],
    [
        'name' => 'BS. Hoàng Văn Em',
        'email' => 'bs.tim@clinic.com',
        'specialization' => 'cardiology', // Tim mạch
    ],
    [
        'name' => 'BS. Đặng Thị Phương',
        'email' => 'bs.da@clinic.com',
        'specialization' => 'dermatology', // Da liễu
    ],
    [
        'name' => 'BS. Võ Văn Giang',
        'email' => 'bs.xuong@clinic.com',
        'specialization' => 'orthopedics', // Chấn thương chỉnh hình
    ],
    [
        'name' => 'BS. Bùi Thị Hoa',
        'email' => 'bs.mat@clinic.com',
        'specialization' => 'ophthalmology', // Mắt
    ],
    [
        'name' => 'BS. Đinh Văn Tuấn',
        'email' => 'bs.tmh@clinic.com',
        'specialization' => 'ent', // Tai mũi họng
    ],
];

echo "=== TẠO BÁC SĨ TEST ===\n\n";

foreach ($doctors as $doctorData) {
    $user = User::updateOrCreate(
        ['email' => $doctorData['email']],
        [
            'name' => $doctorData['name'],
            'password' => Hash::make('password123'),
            'specialization' => $doctorData['specialization'],
            'status' => 'active',
            'phone' => '0909' . rand(100000, 999999),
            'license_number' => 'BS' . rand(100000, 999999),
            'approved_at' => now(),
        ]
    );

    // Assign doctor role
    if (!$user->hasRole('doctor')) {
        $user->assignRole($doctorRole);
    }

    echo "✓ Đã tạo: {$user->name} - Chuyên khoa: {$user->specialization}\n";
}

echo "\n=== HOÀN THÀNH ===\n";
echo "Tất cả bác sĩ đã được tạo với:\n";
echo "- Password: password123\n";
echo "- Status: active\n";
