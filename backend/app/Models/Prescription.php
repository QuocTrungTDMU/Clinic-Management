<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $fillable = [
        'medical_record_id',
        'patient_id',
        'doctor_id',
        'status',
        'total_amount',
        'dispensed_by',
        'dispensed_at',
        'general_instructions',
        'precautions',
        'diet_advice',
        'lifestyle_advice',
        'total_cost',
        'is_printed',
        'printed_at',
    ];

    protected $casts = [
        'is_printed' => 'boolean',
        'printed_at' => 'datetime',
        'dispensed_at' => 'datetime',
        'total_cost' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function medicalRecord()
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    public function dispensedBy()
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }

    public function pharmacyTransaction()
    {
        return $this->hasOne(PharmacyTransaction::class);
    }

    public function billingInvoice()
    {
        return $this->hasOne(BillingInvoice::class);
    }

    public function medicineReservations()
    {
        return $this->hasMany(MedicineReservation::class);
    }

    public function prescriptionItems()
    {
        return $this->hasMany(PrescriptionItem::class);
    }
}
