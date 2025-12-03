<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingInvoice extends Model
{
    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_id',
        'medical_record_id',
        'prescription_id',
        'consultation_fee',
        'medication_cost',
        'lab_test_cost',
        'total_amount',
        'status',
        'payment_reference',
        'payment_method',
        'amount_paid',
        'change_amount',
        'processed_by',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'consultation_fee' => 'decimal:2',
        'medication_cost' => 'decimal:2',
        'lab_test_cost' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Calculate total amount
     */
    public function calculateTotal(): void
    {
        $this->total_amount = $this->consultation_fee + $this->medication_cost + $this->lab_test_cost;
        $this->save();
    }

    /**
     * Mark as paid
     */
    public function markAsPaid(int $processedBy, string $paymentMethod, float $amountPaid): void
    {
        $this->update([
            'status' => 'paid',
            'payment_method' => $paymentMethod,
            'amount_paid' => $amountPaid,
            'change_amount' => $amountPaid - $this->total_amount,
            'processed_by' => $processedBy,
            'paid_at' => now(),
        ]);
    }
}
