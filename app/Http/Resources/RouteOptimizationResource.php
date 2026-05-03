<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Standard route payload for API consumers (maps, dashboards).
 *
 * @mixin \App\Models\DeliveryRoute
 */
class RouteOptimizationResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        $this->resource->loadMissing(['deliveryCenter', 'vehicle', 'routeStops.order']);

        $stops = $this->routeStops
            ->sortBy('sequence')
            ->values()
            ->map(function ($stop) {
                $order = $stop->order;

                return [
                    'sequence' => (int) $stop->sequence,
                    'order_id' => (int) $stop->order_id,
                    'latitude' => $order ? (float) $order->latitude : 0.0,
                    'longitude' => $order ? (float) $order->longitude : 0.0,
                    'eta' => $stop->estimated_arrival_time !== null
                        ? $stop->estimated_arrival_time->toIso8601String()
                        : '',
                    'distance_from_previous' => round((float) $stop->distance_from_previous, 3),
                ];
            })
            ->values()
            ->all();

        $center = $this->deliveryCenter;

        return [
            'route_id' => (int) $this->id,
            'delivery_center' => [
                'id' => (int) $center->id,
                'name' => (string) $center->name,
                'latitude' => (float) $center->latitude,
                'longitude' => (float) $center->longitude,
            ],
            'vehicle' => [
                'id' => (int) $this->vehicle->id,
                'name' => (string) $this->vehicle->name,
            ],
            'total_distance' => round((float) $this->total_distance, 3),
            'total_time' => (int) $this->total_time,
            'stops' => $stops,
            'comparison_batch_id' => $this->comparison_batch_id,
            'optimization_profile' => $this->optimization_profile instanceof \BackedEnum
                ? $this->optimization_profile->value
                : $this->optimization_profile,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'next_stop_sequence' => $this->next_stop_sequence,
            'departure_at' => optional($this->departure_at)?->toIso8601String(),
            'geometry' => $this->geometry,
        ];
    }
}
