<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_id',
        'chief_complaint',
        'symptoms',
        'physical_examination',
        'vital_signs',
        'diagnosis',
        'differential_diagnosis',
        'treatment_plan',
        'recommendations',
        'follow_up_date',
        'follow_up_notes',
        'doctor_notes',
        'patient_allergies',
    ];

    protected $casts = [
        'vital_signs' => 'array',
        'follow_up_date' => 'date',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }
}
