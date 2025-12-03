<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$invoice = App\Models\BillingInvoice::with([
    'patient:id,name,phone,dob,gender,address',
    'doctor:id,name',
    'appointment:id,appointment_datetime,reason',
    'medicalRecord:id,diagnosis,doctor_notes',
    'prescription.prescriptionItems.medicine:id,name,price,unit',
    'processedBy:id,name'
])->find(1);

if (!$invoice) {
    echo "Invoice not found\n";
    exit;
}

echo "=== INVOICE DATA ===\n";
echo json_encode($invoice->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
