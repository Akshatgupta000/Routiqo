<?php

namespace App\Models;

use App\Enums\OrderPriority;
use App\Enums\OrderStatus;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;
    protected $fillable = [
        'address',
        'latitude',
        'longitude',
        'delivery_center_id',
        'vehicle_id',
        'status',
        'priority',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'priority' => OrderPriority::class,
            'status' => OrderStatus::class,
        ];
    }

    public function deliveryCenter(): BelongsTo
    {
        return $this->belongsTo(DeliveryCenter::class);
    }

    public function routeStop(): HasOne
    {
        return $this->hasOne(RouteStop::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', OrderStatus::Pending);
    }
}
