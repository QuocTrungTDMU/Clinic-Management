<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Appointment;
use App\Models\Patient;
use Carbon\Carbon;

echo "=== SERVER TIME ===\n";
echo "Now: " . Carbon::now()->format('Y-m-d H:i:s') . "\n";
echo "Today: " . Carbon::today()->format('Y-m-d') . "\n\n";

echo "=== LATEST APPOINTMENT (Trần Văn Test) ===\n";
$patient = Patient::where('name', 'LIKE', '%Trần Văn Test%')->first();

if ($patient) {
    $appointment = Appointment::where('patient_id', $patient->id)
        ->latest()
        ->first();

    if ($appointment) {
        echo "ID: " . $appointment->id . "\n";
        echo "Patient: " . $appointment->patient->name . "\n";
        echo "Doctor: " . $appointment->doctor->name . "\n";
        echo "Datetime: " . $appointment->appointment_datetime . "\n";
        echo "Status: " . $appointment->status . "\n";
        echo "Is Today?: " . ($appointment->appointment_datetime->isToday() ? 'YES' : 'NO') . "\n";
        echo "Date only: " . $appointment->appointment_datetime->format('Y-m-d') . "\n";
    } else {
        echo "No appointment found for this patient\n";
    }
} else {
    echo "Patient not found\n";
}

echo "\n=== ALL APPOINTMENTS TODAY ===\n";
$todayAppointments = Appointment::with(['patient', 'doctor'])
    ->whereDate('appointment_datetime', Carbon::today())
    ->get();

echo "Count: " . $todayAppointments->count() . "\n";
foreach ($todayAppointments as $apt) {
    echo "- " . $apt->patient->name . " (" . $apt->status . ") at " . $apt->appointment_datetime . "\n";
}
