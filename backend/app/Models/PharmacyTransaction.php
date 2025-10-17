<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PharmacyTransaction extends Model
{
    protected $fillable = [
        'prescription_id',
        'patient_id',
        'pharmacist_id',
        'total_amount',
        'payment_method',
        'payment_status',
        'transaction_date',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function pharmacist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pharmacist_id');
    }
}
