<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_center_id',
        'polygon_coordinates',
    ];

    protected $casts = [
        'polygon_coordinates' => 'array',
    ];

    public function deliveryCenter(): BelongsTo
    {
        return $this->belongsTo(DeliveryCenter::class);
    }
}
