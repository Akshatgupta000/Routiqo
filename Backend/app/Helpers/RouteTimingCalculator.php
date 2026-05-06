<?php

namespace App\Helpers;

use App\Models\Order;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * ETA from leg distances and vehicle average speed (km/h) plus dwell time per stop.
 */
final class RouteTimingCalculator
{
    /**
     * @param  array<int, Order>  $orderedStops
     * @return array{
     *     total_seconds: int,
     *     etas: array<int, CarbonInterface>,
     *     leg_distances_km: array<int, float>
     * }
     */
    public function compute(
        CarbonInterface $departure,
        array $orderedStops,
        float $depotLat,
        float $depotLon,
        float $averageSpeedKmh,
        int $serviceSecondsPerStop,
    ): array {
        if ($orderedStops === []) {
            return ['total_seconds' => 0, 'etas' => [], 'leg_distances_km' => []];
        }

        $speed = max($averageSpeedKmh, 1.0);
        $etas = [];
        $legs = [];
        $cursor = Carbon::instance($departure);
        $prev = ['lat' => $depotLat, 'lon' => $depotLon];
        $total = 0;

        foreach ($orderedStops as $index => $order) {
            $point = ['lat' => (float) $order->latitude, 'lon' => (float) $order->longitude];
            $km = DistanceHelper::betweenPoints($prev, $point);
            $legs[$index] = round($km, 3);
            $travel = (int) round(($km / $speed) * 3600);
            $total += $travel;
            $cursor = $cursor->copy()->addSeconds($travel);
            $etas[$index] = $cursor->copy();
            $cursor = $cursor->copy()->addSeconds($serviceSecondsPerStop);
            $total += $serviceSecondsPerStop;
            $prev = $point;
        }

        $returnKm = DistanceHelper::betweenPoints($prev, ['lat' => $depotLat, 'lon' => $depotLon]);
        $returnTravel = (int) round(($returnKm / $speed) * 3600);
        $total += $returnTravel;

        return [
            'total_seconds' => $total,
            'etas' => $etas,
            'leg_distances_km' => $legs,
        ];
    }
}
