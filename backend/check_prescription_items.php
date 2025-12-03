<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$invoice = App\Models\BillingInvoice::find(1);

if (!$invoice) {
    echo "Invoice not found\n";
    exit;
}

echo "Invoice ID: " . $invoice->id . "\n";
echo "Prescription ID: " . ($invoice->prescription_id ?? 'NULL') . "\n";

if ($invoice->prescription_id) {
    $prescription = $invoice->prescription;
    if ($prescription) {
        echo "Prescription exists\n";
        echo "Prescription Items Count: " . $prescription->prescriptionItems->count() . "\n";

        if ($prescription->prescriptionItems->count() > 0) {
            echo "\nPrescription Items:\n";
            foreach ($prescription->prescriptionItems as $item) {
                echo "  - Medicine: " . ($item->medicine_name ?? 'N/A') . "\n";
                echo "    Quantity: " . $item->quantity . "\n";
                echo "    Price: " . $item->unit_price . "\n";
            }
        } else {
            echo "No prescription items found\n";
        }
    } else {
        echo "Prescription not found in database\n";
    }
} else {
    echo "No prescription linked to this invoice\n";
}
