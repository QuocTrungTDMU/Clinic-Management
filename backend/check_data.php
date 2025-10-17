<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Appointment;
use Carbon\Carbon;

echo "=== USERS ===\n";
$users = User::all();
foreach ($users as $user) {
    echo "ID: {$user->id} - {$user->name} ({$user->email}) - Role: {$user->role}\n";
}

echo "\n=== APPOINTMENTS TODAY (in_progress) ===\n";
$appointments = Appointment::with(['patient', 'doctor'])
    ->whereDate('appointment_datetime', Carbon::today())
    ->where('status', 'in_progress')
    ->get();

foreach ($appointments as $apt) {
    echo "ID: {$apt->id} - Patient: {$apt->patient->name} - Doctor: {$apt->doctor->name} (ID: {$apt->doctor->id})\n";
    echo "  Time: {$apt->appointment_datetime->format('Y-m-d H:i')} - Status: {$apt->status}\n";
}

echo "\n=== TOTAL STATS ===\n";
echo "Total Patients: " . \App\Models\Patient::count() . "\n";
echo "Total Appointments: " . Appointment::count() . "\n";
echo "In Progress Today: " . $appointments->count() . "\n";
