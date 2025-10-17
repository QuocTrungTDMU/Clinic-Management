<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medicine extends Model
{
    protected $fillable = [
        'name',
        'medicine_type',
        'strength',
        'unit',
        'cost_price',
        'selling_price',
        'stock_quantity',
        'min_stock_alert',
        'category',
        'usage_instructions',
        'requires_prescription',
        'status',
        'notes',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'min_stock_alert' => 'integer',
        'requires_prescription' => 'boolean',
    ];

    /**
     * Get prescription items using this medicine
     */
    public function prescriptionItems(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    /**
     * Check if medicine is low in stock
     */
    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->min_stock_alert;
    }

    /**
     * Check if medicine is out of stock
     */
    public function isOutOfStock(): bool
    {
        return $this->stock_quantity <= 0;
    }

    /**
     * Decrease stock quantity
     */
    public function decreaseStock(int $quantity): bool
    {
        if ($this->stock_quantity >= $quantity) {
            $this->stock_quantity -= $quantity;
            return $this->save();
        }
        return false;
    }

    /**
     * Increase stock quantity
     */
    public function increaseStock(int $quantity): bool
    {
        $this->stock_quantity += $quantity;
        return $this->save();
    }
}
