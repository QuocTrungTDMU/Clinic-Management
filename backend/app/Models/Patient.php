<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'medical_history',
        'allergies',
        'emergency_contact',
        'note',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    /**
     * Accessors for compatibility with frontend
     */
    protected $appends = ['first_name', 'last_name', 'date_of_birth'];

    public function getFirstNameAttribute()
    {
        // Split name into parts and return first name
        $parts = explode(' ', $this->name);
        return end($parts); // Vietnamese: last part is first name
    }

    public function getLastNameAttribute()
    {
        // Split name into parts and return last name
        $parts = explode(' ', $this->name);
        array_pop($parts); // Remove first name
        return implode(' ', $parts); // Remaining is last name
    }

    public function getDateOfBirthAttribute()
    {
        return $this->attributes['dob'] ?? null;
    }

    /**
     * Get the appointments for the patient.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the medical records for the patient.
     */
    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }
}
