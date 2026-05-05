<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteStop extends Model
{
    protected $fillable = [
        'route_id',
        'order_id',
        'sequence',
        'distance_from_previous',
        'estimated_arrival_time',
    ];

    protected function casts(): array
    {
        return [
            'sequence' => 'integer',
            'distance_from_previous' => 'float',
            'estimated_arrival_time' => 'datetime',
        ];
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(DeliveryRoute::class, 'route_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
