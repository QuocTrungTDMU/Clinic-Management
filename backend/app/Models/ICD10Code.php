<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ICD10Code extends Model
{
    use HasFactory;

    protected $table = 'icd10_codes';

    protected $fillable = [
        'code',
        'name',
        'name_en',
        'category',
        'description',
        'specialty',
        'is_common'
    ];

    protected $casts = [
        'is_common' => 'boolean',
    ];

    // Relationship với medical records
    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class, 'icd10_id');
    }

    // Scope để lấy các bệnh phổ biến
    public function scopeCommon($query)
    {
        return $query->where('is_common', true);
    }

    // Scope để search theo tên hoặc mã
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")
                ->orWhere('name_en', 'like', "%{$search}%");
        });
    }

    // Scope để lọc theo chuyên khoa
    public function scopeBySpecialty($query, $specialty)
    {
        return $query->where('specialty', $specialty);
    }
}
