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
                    'order_id' => $stop->order_id,
                    'order' => $order ? [
                        'address' => $order->address,
                    ] : null,
                    'latitude' => $order ? (float) $order->latitude : 0.0,
                    'longitude' => $order ? (float) $order->longitude : 0.0,
                    'priority' => $order ? ($order->priority instanceof \BackedEnum ? $order->priority->value : $order->priority) : 'normal',
                    'eta' => $stop->estimated_arrival_time !== null
                        ? $stop->estimated_arrival_time->toIso8601String()
                        : '',
                    'distance_from_previous' => round((float) $stop->distance_from_previous, 3),
                ];
            })
            ->values()
            ->all();

        $center = $this->deliveryCenter;

        $routeName = 'Route #' . substr($this->id, -6);
        $firstStop = $stops[0] ?? null;
        if ($firstStop && isset($firstStop['order']['address']) && $firstStop['order']['address']) {
            $addressParts = array_map('trim', explode(',', $firstStop['order']['address']));
            
            $street = '';
            // Try to find a part that clearly looks like a road name
            foreach ($addressParts as $part) {
                if (preg_match('/\b(Road|Rd|Street|St|Avenue|Ave|Marg|Highway|Hwy|Lane|Ln|Boulevard|Blvd|Drive|Dr|Way|Square|Sq|Plaza|Parkway|Pkwy|Alley|Court|Ct|Circle|Cir)\b/i', $part)) {
                    $street = $part;
                    break;
                }
            }
            
            // Smart fallback if no keyword is found
            if (empty($street)) {
                if (count($addressParts) > 1) {
                    // In standard Nominatim, index 1 is often the road if index 0 is a building/number
                    $street = is_numeric(trim($addressParts[0], " \t\n\r\0\x0B-/#")) ? $addressParts[1] : $addressParts[0];
                } else {
                    $street = $addressParts[0];
                }
            }
            
            if (!empty($street)) {
                // Clean up leading numbers or irrelevant characters
                $street = preg_replace('/^[0-9\-\#]+\s+/', '', $street);
                $routeName = 'Route via ' . trim($street);
            }
        }

        return [
            'route_id' => $this->id,
            'route_name' => $routeName,
            'delivery_center' => $center ? [
                'id' => $center->id,
                'name' => (string) $center->name,
                'latitude' => (float) $center->latitude,
                'longitude' => (float) $center->longitude,
            ] : null,
            'vehicle' => $this->vehicle ? [
                'id' => $this->vehicle->id,
                'name' => (string) $this->vehicle->name,
            ] : null,
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
