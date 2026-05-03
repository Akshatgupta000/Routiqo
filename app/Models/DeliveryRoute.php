<?php

namespace App\Models;

use App\Enums\OptimizationProfile;
use App\Enums\RouteStatus;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryRoute extends Model
{
    protected $table = 'routes';

    protected $fillable = [
        'delivery_center_id',
        'vehicle_id',
        'comparison_batch_id',
        'optimization_profile',
        'total_distance',
        'total_time',
        'status',
        'next_stop_sequence',
        'departure_at',
    ];

    protected function casts(): array
    {
        return [
            'total_distance' => 'float',
            'total_time' => 'integer',
            'status' => RouteStatus::class,
            'optimization_profile' => OptimizationProfile::class,
            'departure_at' => 'datetime',
            'next_stop_sequence' => 'integer',
        ];
    }

    public function deliveryCenter(): BelongsTo
    {
        return $this->belongsTo(DeliveryCenter::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function routeStops(): HasMany
    {
        return $this->hasMany(RouteStop::class, 'route_id');
    }
}
