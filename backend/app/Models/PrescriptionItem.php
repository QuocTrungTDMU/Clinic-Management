<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrescriptionItem extends Model
{
    protected $fillable = [
        'prescription_id',
        'medicine_id',
        'medicine_name',
        'medicine_type',
        'strength',
        'dosage',
        'frequency',
        'duration',
        'quantity',
        'quantity_prescribed',
        'quantity_dispensed',
        'unit_price',
        'subtotal',
        'total_price',
        'instructions',
        'morning',
        'afternoon',
        'evening',
        'before_meal',
        'after_meal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'quantity_prescribed' => 'integer',
        'quantity_dispensed' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'total_price' => 'decimal:2',
        'morning' => 'boolean',
        'afternoon' => 'boolean',
        'evening' => 'boolean',
        'before_meal' => 'boolean',
        'after_meal' => 'boolean',
    ];

    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
