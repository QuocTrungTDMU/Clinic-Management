<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabTestType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category',
        'description',
        'price',
        'sample_type',
        'duration_minutes',
        'preparation_instructions',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Relationship với lab tests
    public function labTests()
    {
        return $this->hasMany(LabTest::class);
    }

    // Scope để lấy các xét nghiệm đang hoạt động
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope để lọc theo loại
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
