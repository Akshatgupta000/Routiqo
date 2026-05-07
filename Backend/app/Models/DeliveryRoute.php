<?php

namespace App\Models;

use App\Enums\OptimizationProfile;
use App\Enums\RouteStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Traits\BelongsToUser;

class DeliveryRoute extends Model
{
    use BelongsToUser;
    protected $table = 'routes';

    protected $fillable = [
        'user_id',
        'delivery_center_id',
        'vehicle_id',
        'comparison_batch_id',
        'optimization_profile',
        'total_distance',
        'total_time',
        'status',
        'next_stop_sequence',
        'departure_at',
        'geometry',
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
            'geometry' => 'array',
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
