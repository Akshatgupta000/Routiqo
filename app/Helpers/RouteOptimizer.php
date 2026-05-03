<?php

namespace App\Helpers;

use App\Models\Order;
use Illuminate\Support\Collection;

/**
 * Phase 1: construction (nearest-neighbor or cheapest insertion by time).
 * Phase 2: 2-opt improvement using the same edge metric as the construction profile.
 */
final class RouteOptimizer
{
    private const TWO_OPT_EPSILON = 1e-6;

    public function __construct(
        private readonly float $depotLat,
        private readonly float $depotLon,
    ) {}

    /**
     * Minimize total kilometers (depot → stops → depot).
     *
     * @param  Collection<int, Order>  $orders
     * @return array<int, Order>
     */
    public function buildShortestDistanceTour(Collection $orders): array
    {
        if ($orders->isEmpty()) {
            return [];
        }

        $tour = $this->nearestNeighborByDistance($orders);

        return $this->twoOptByMetric(
            $tour,
            fn (array $a, array $b) => DistanceHelper::betweenPoints($a, $b),
            0,
            $orders
        );
    }

    /**
     * Heuristic minimizing total **time** (seconds) including travel and per-stop service,
     * using cheapest insertion, then 2-opt on the time metric.
     *
     * @param  Collection<int, Order>  $orders
     * @return array<int, Order>
     */
    public function buildFastestTimeTour(Collection $orders, float $averageSpeedKmh, int $serviceSecondsPerStop): array
    {
        if ($orders->isEmpty()) {
            return [];
        }

        $speed = max($averageSpeedKmh, 1.0);
        $travelTime = static fn (array $a, array $b): float => (DistanceHelper::betweenPoints($a, $b) / $speed) * 3600.0;

        $tour = $this->cheapestInsertionByTime($orders, $travelTime, $serviceSecondsPerStop);

        $edgeMetric = static fn (array $a, array $b): float => $travelTime($a, $b);

        return $this->twoOptByMetric($tour, $edgeMetric, 0, $orders);
    }

    public function tourDistanceKm(array $orderedStops): float
    {
        return $this->closedTourLength($orderedStops, fn ($a, $b) => DistanceHelper::betweenPoints($a, $b));
    }

    public function tourTimeSeconds(array $orderedStops, float $averageSpeedKmh, int $serviceSecondsPerStop): float
    {
        $speed = max($averageSpeedKmh, 1.0);
        $travelTime = static fn (array $a, array $b): float => (DistanceHelper::betweenPoints($a, $b) / $speed) * 3600.0;

        return $this->closedTourLength($orderedStops, $travelTime) + count($orderedStops) * $serviceSecondsPerStop;
    }

    /**
     * @param  Collection<int, Order>  $orders
     * @return array<int, Order>
     */
    private function nearestNeighborByDistance(Collection $orders): array
    {
        $unvisited = $orders->keyBy('id');
        $tour = [];
        $current = $this->depotPoint();

        while ($unvisited->isNotEmpty()) {
            $best = $this->selectNextByDistance($unvisited, $current);
            $tour[] = $best;
            $current = $this->orderPoint($best);
            $unvisited->forget($best->id);
        }

        return $tour;
    }

    /**
     * @param  Collection<int, Order>  $unvisited
     */
    private function selectNextByDistance(Collection $unvisited, array $current): Order
    {
        $candidates = $unvisited->values()->all();

        usort($candidates, function (Order $a, Order $b) use ($current) {
            $da = DistanceHelper::betweenPoints($current, $this->orderPoint($a));
            $db = DistanceHelper::betweenPoints($current, $this->orderPoint($b));

            if (abs($da - $db) > self::TWO_OPT_EPSILON) {
                return $da <=> $db;
            }

            return $b->priority->rank() <=> $a->priority->rank();
        });

        return $candidates[0];
    }

    /**
     * @param  Collection<int, Order>  $orders
     * @param  callable(array, array): float  $travelTimeSeconds
     * @return array<int, Order>
     */
    private function cheapestInsertionByTime(Collection $orders, callable $travelTimeSeconds, int $serviceSecondsPerStop): array
    {
        $remaining = $orders->values()->all();
        if ($remaining === []) {
            return [];
        }

        $seedIdx = 0;
        $seedBestTime = INF;
        foreach ($remaining as $idx => $order) {
            $travel = $travelTimeSeconds($this->depotPoint(), $this->orderPoint($order));
            if ($travel + self::TWO_OPT_EPSILON < $seedBestTime) {
                $seedBestTime = $travel;
                $seedIdx = $idx;
                continue;
            }

            if (abs($travel - $seedBestTime) <= self::TWO_OPT_EPSILON
                && $order->priority->rank() > $remaining[$seedIdx]->priority->rank()) {
                $seedIdx = $idx;
            }
        }

        $seed = $remaining[$seedIdx];
        array_splice($remaining, $seedIdx, 1);
        $tour = [$seed];

        while ($remaining !== []) {
            $bestIncrease = INF;
            $bestOrder = null;
            $bestOrderIdx = null;
            $bestPosition = 0;

            foreach ($remaining as $idx => $candidate) {
                $n = count($tour);
                for ($pos = 0; $pos <= $n; $pos++) {
                    $increase = $this->marginalInsertionTimeSeconds(
                        $tour,
                        $candidate,
                        $pos,
                        $travelTimeSeconds,
                        $serviceSecondsPerStop
                    );

                    if ($increase + self::TWO_OPT_EPSILON < $bestIncrease) {
                        $bestIncrease = $increase;
                        $bestOrder = $candidate;
                        $bestOrderIdx = $idx;
                        $bestPosition = $pos;
                    }
                }
            }

            if (! $bestOrder instanceof Order || $bestOrderIdx === null) {
                break;
            }

            array_splice($tour, $bestPosition, 0, [$bestOrder]);
            unset($remaining[$bestOrderIdx]);
            $remaining = array_values($remaining);
        }

        return $tour;
    }

    /**
     * @param  array<int, Order>  $tour
     */
    private function marginalInsertionTimeSeconds(
        array $tour,
        Order $candidate,
        int $position,
        callable $travelTimeSeconds,
        int $serviceSecondsPerStop
    ): float {
        $before = $this->tourTimeWithService($tour, $travelTimeSeconds, $serviceSecondsPerStop);
        $trial = $tour;
        array_splice($trial, $position, 0, [$candidate]);

        $after = $this->tourTimeWithService($trial, $travelTimeSeconds, $serviceSecondsPerStop);

        return $after - $before;
    }

    /**
     * @param  array<int, Order>  $tour
     * @param  callable(array, array): float  $travelTimeSeconds
     */
    private function tourTimeWithService(array $tour, callable $travelTimeSeconds, int $serviceSecondsPerStop): float
    {
        if ($tour === []) {
            return 0.0;
        }

        $prev = $this->depotPoint();
        $total = 0.0;

        foreach ($tour as $order) {
            $p = $this->orderPoint($order);
            $total += $travelTimeSeconds($prev, $p);
            $total += $serviceSecondsPerStop;
            $prev = $p;
        }

        $total += $travelTimeSeconds($prev, $this->depotPoint());

        return $total;
    }

    /**
     * @param  array<int, Order>  $tour
     * @param  callable(array, array): float  $edgeMetric
     * @return array<int, Order>
     */
    /**
     * @param  Collection<int, Order>  $allOrders
     */
    private function twoOptByMetric(array $tour, callable $edgeMetric, int $servicePerStop, Collection $allOrders): array
    {
        $n = count($tour);
        if ($n < 4) {
            return $this->ensureUniqueOrderCoverage($tour, $allOrders);
        }

        $best = $tour;
        $bestCost = $this->closedTourLength($best, $edgeMetric) + $n * $servicePerStop;
        $improved = true;

        while ($improved) {
            $improved = false;

            for ($i = 0; $i < $n - 1; $i++) {
                for ($j = $i + 2; $j < $n; $j++) {
                    $candidate = $this->reverseSegment($best, $i + 1, $j);
                    $cost = $this->closedTourLength($candidate, $edgeMetric) + count($candidate) * $servicePerStop;

                    if ($cost + self::TWO_OPT_EPSILON < $bestCost) {
                        $best = $candidate;
                        $bestCost = $cost;
                        $improved = true;
                    }
                }
            }
        }

        return $this->ensureUniqueOrderCoverage($best, $allOrders);
    }

    /**
     * @param  array<int, Order>  $tour
     * @param  callable(array, array): float  $edgeMetric
     */
    private function closedTourLength(array $tour, callable $edgeMetric): float
    {
        if ($tour === []) {
            return 0.0;
        }

        $prev = $this->depotPoint();
        $total = 0.0;

        foreach ($tour as $stop) {
            $p = $this->orderPoint($stop);
            $total += $edgeMetric($prev, $p);
            $prev = $p;
        }

        $total += $edgeMetric($prev, $this->depotPoint());

        return $total;
    }

    /**
     * @param  array<int, Order>  $tour
     * @return array<int, Order>
     */
    private function reverseSegment(array $tour, int $i, int $j): array
    {
        $prefix = array_slice($tour, 0, $i);
        $middle = array_slice($tour, $i, $j - $i + 1);
        $suffix = array_slice($tour, $j + 1);

        return array_merge($prefix, array_reverse($middle), $suffix);
    }

    /**
     * @param  array<int, Order>  $tour
     * @param  Collection<int, Order>  $source
     * @return array<int, Order>
     */
    private function ensureUniqueOrderCoverage(array $tour, Collection $source): array
    {
        $seen = [];
        $deduped = [];

        foreach ($tour as $order) {
            if (! isset($seen[$order->id])) {
                $seen[$order->id] = true;
                $deduped[] = $order;
            }
        }

        if (count($deduped) !== $source->count()) {
            $missing = $source->reject(fn (Order $o) => isset($seen[$o->id]))->sortByDesc(fn ($o) => $o->priority->rank())->values();
            foreach ($missing as $order) {
                $deduped[] = $order;
            }
        }

        return $deduped;
    }

    private function depotPoint(): array
    {
        return ['lat' => $this->depotLat, 'lon' => $this->depotLon];
    }

    private function orderPoint(Order $order): array
    {
        return ['lat' => (float) $order->latitude, 'lon' => (float) $order->longitude];
    }
}
