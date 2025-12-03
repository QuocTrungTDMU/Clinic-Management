<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicineReservation extends Model
{
    protected $fillable = [
        'prescription_id',
        'prescription_item_id',
        'medicine_id',
        'medicine_name',
        'reserved_quantity',
        'unit',
        'status',
        'reserved_at',
        'dispensed_at',
        'reserved_by',
        'dispensed_by',
    ];

    protected $casts = [
        'reserved_quantity' => 'integer',
        'reserved_at' => 'datetime',
        'dispensed_at' => 'datetime',
    ];

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    public function prescriptionItem(): BelongsTo
    {
        return $this->belongsTo(PrescriptionItem::class);
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function reservedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reserved_by');
    }

    public function dispensedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }

    /**
     * Mark as dispensed and deduct real stock
     */
    public function markAsDispensed(int $dispensedBy): void
    {
        // Deduct real stock from medicines table
        if ($this->medicine_id) {
            $medicine = Medicine::find($this->medicine_id);
            if ($medicine) {
                $medicine->stock_quantity -= $this->reserved_quantity;
                $medicine->save();
            }
        }

        $this->update([
            'status' => 'dispensed',
            'dispensed_at' => now(),
            'dispensed_by' => $dispensedBy,
        ]);
    }

    /**
     * Cancel reservation and restore virtual stock
     */
    public function cancelReservation(): void
    {
        $this->update(['status' => 'cancelled']);
    }
}
