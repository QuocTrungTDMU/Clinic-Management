<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get all doctors
$doctors = \App\Models\User::whereHas('roles', function ($query) {
    $query->where('name', 'doctor');
})->get(['id', 'name', 'specialization', 'status']);

echo "=== DANH SÁCH BÁC SĨ ===\n\n";
if ($doctors->isEmpty()) {
    echo "Không có bác sĩ nào trong database!\n";
} else {
    foreach ($doctors as $doctor) {
        echo "ID: {$doctor->id}\n";
        echo "Tên: {$doctor->name}\n";
        echo "Chuyên khoa: {$doctor->specialization}\n";
        echo "Trạng thái: {$doctor->status}\n";
        echo "-------------------\n";
    }
}
