<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ServiceZone;
use Illuminate\Support\Facades\Log;

class ServiceZoneService
{
    /**
     * Determine which hub owns the given order based on Voronoi zones.
     */
    public function findHubForOrder(Order $order): ?string
    {
        $lat = (float) $order->latitude;
        $lng = (float) $order->longitude;

        $zones = ServiceZone::all();

        foreach ($zones as $zone) {
            if ($this->isPointInPolygon($lat, $lng, $zone->polygon_coordinates)) {
                return $zone->delivery_center_id;
            }
        }

        return null;
    }

    /**
     * Ray Casting Algorithm for Point-in-Polygon check.
     */
    public function isPointInPolygon(float $lat, float $lng, array $polygon): bool
    {
        $inside = false;
        $n = count($polygon);
        
        if ($n < 3) return false;

        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $xi = (float) $polygon[$i][0];
            $yi = (float) $polygon[$i][1];
            $xj = (float) $polygon[$j][0];
            $yj = (float) $polygon[$j][1];

            $intersect = (($yi > $lng) != ($yj > $lng))
                && ($lat < ($xj - $xi) * ($lng - $yi) / ($yj - $yi) + $xi);
            
            if ($intersect) {
                $inside = !$inside;
            }
        }

        return $inside;
    }
}
