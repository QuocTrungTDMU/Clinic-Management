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

        // Vital signs (dấu hiệu sinh tồn)
        'blood_pressure',
        'temperature',
        'heart_rate',
        'respiratory_rate',
        'oxygen_saturation',
        'weight',
        'height',
        'bmi',

        // Diagnosis
        'diagnosis',
        'differential_diagnosis',
        'icd10_id',
        'icd10_code',

        // Treatment
        'treatment_plan',
        'recommendations',
        'clinical_notes',

        // Follow-up
        'follow_up_date',
        'follow_up_notes',
        'doctor_notes',
        'patient_allergies',
        'notes', // Alias for doctor_notes
    ];

    protected $casts = [
        'vital_signs' => 'array',
        'follow_up_date' => 'date',
        'temperature' => 'decimal:1',
        'oxygen_saturation' => 'decimal:2',
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
        'bmi' => 'decimal:2',
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

    public function prescription()
    {
        return $this->hasOne(Prescription::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function labTests()
    {
        return $this->hasMany(LabTest::class);
    }

    public function icd10()
    {
        return $this->belongsTo(ICD10Code::class, 'icd10_id');
    }
}
