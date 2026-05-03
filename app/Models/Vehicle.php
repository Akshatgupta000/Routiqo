<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'capacity',
        'average_speed',
        'is_available',
        'delivery_center_id',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'average_speed' => 'float',
            'is_available' => 'boolean',
        ];
    }

    public function deliveryCenter(): BelongsTo
    {
        return $this->belongsTo(DeliveryCenter::class);
    }

    public function routes(): HasMany
    {
        return $this->hasMany(DeliveryRoute::class);
    }
}
