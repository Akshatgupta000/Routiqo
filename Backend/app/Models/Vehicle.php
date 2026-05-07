<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Traits\BelongsToUser;

class Vehicle extends Model
{
    use HasFactory, BelongsToUser;
    protected $fillable = [
        'user_id',
        'name',
        'vehicle_number',
        'capacity',
        'average_speed',
        'is_available',
        'current_load',
        'delivery_center_id',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'average_speed' => 'float',
            'is_available' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
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
