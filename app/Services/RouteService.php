<?php

namespace App\Services;

use App\Enums\OptimizationProfile;
use App\Enums\OrderStatus;
use App\Enums\RouteStatus;
use App\Helpers\RouteOptimizer;
use App\Helpers\RouteTimingCalculator;
use App\Models\DeliveryCenter;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\Vehicle;
use App\Repositories\Contracts\DeliveryCenterRepositoryInterface;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\RouteRepositoryInterface;
use App\Repositories\Contracts\VehicleRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Carbon;

class RouteService
{
    private const ROUTE_CACHE_TTL_SECONDS = 600;

    private const SERVICE_SECONDS_PER_STOP = 180;

    public function __construct(
        private readonly DeliveryCenterRepositoryInterface $centers,
        private readonly OrderRepositoryInterface $orders,
        private readonly VehicleRepositoryInterface $vehicles,
        private readonly RouteRepositoryInterface $routes,
    ) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    public function generateRoutes(mixed $deliveryCenterId = null, ?Carbon $departureAt = null): array
    {
        $departureAt ??= now();

        Log::info('route.generate.start', [
            'delivery_center_id' => $deliveryCenterId,
            'departure_at' => $departureAt->toIso8601String(),
        ]);

        $centers = $this->resolveCenters($deliveryCenterId);
        $comparisons = [];

        foreach ($centers as $center) {
            $batch = $this->processCenter($center, $departureAt);
            $comparisons = array_merge($comparisons, $batch);
        }

        Log::info('route.generate.complete', ['comparisons' => count($comparisons)]);

        if ($comparisons === []) {
            Log::info('route.generate.skip', ['reason' => 'no_comparisons_generated']);
            return [];
        }

        return $comparisons;
    }

    public function generateRouteForVehicle(mixed $vehicleId, ?Carbon $departureAt = null): array
    {
        $departureAt ??= now();
        $vehicle = $this->vehicles->find($vehicleId);
        
        if (!$vehicle) {
            throw ValidationException::withMessages(['vehicle_id' => __('Vehicle not found.')]);
        }

        $center = $vehicle->deliveryCenter;
        $orders = \App\Models\Order::query()
            ->where('vehicle_id', $vehicleId)
            ->where('status', \App\Enums\OrderStatus::Assigned->value)
            ->get();

        if ($orders->isEmpty()) {
            throw ValidationException::withMessages(['vehicle_id' => __('No assigned orders for this vehicle.')]);
        }

        $optimizer = new \App\Helpers\RouteOptimizer((float) $center->latitude, (float) $center->longitude);
        $tour = $optimizer->buildShortestDistanceTour($orders);
        
        $batchId = (string) \Illuminate\Support\Str::uuid();
        $route = $this->persistOptimizedRoute(
            $center,
            $vehicle,
            $tour,
            $departureAt,
            \App\Enums\OptimizationProfile::ShortestDistance,
            $batchId
        );

        return [
            'comparison_batch_id' => $batchId,
            'delivery_center_id' => $center->id,
            'vehicle_id' => $vehicle->id,
            'route' => (new \App\Http\Resources\RouteOptimizationResource($route))->toArray(request()),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function regenerateRoutesForCenter(mixed $deliveryCenterId, ?Carbon $departureAt = null): array
    {
        $center = $this->centers->find($deliveryCenterId);
        if (! $center instanceof DeliveryCenter) {
            throw ValidationException::withMessages([
                'center_id' => __('The selected delivery center is invalid.'),
            ]);
        }

        Log::info('route.regenerate.start', ['delivery_center_id' => $deliveryCenterId]);

        DB::transaction(function () use ($deliveryCenterId): void {
            $planned = $this->routes->plannedRoutesForCenter($deliveryCenterId);
            $orderIds = $planned->flatMap(fn (DeliveryRoute $route) => $route->routeStops->pluck('order_id'))->unique()->values()->all();

            $this->orders->revertAssignedToPending($orderIds);

            foreach ($planned as $route) {
                $this->forgetRouteCache($route->id);
                $this->routes->deleteRoute($route);
            }
        });

        return $this->generateRoutes($deliveryCenterId, $departureAt);
    }

    public function startRoute(mixed $routeId): DeliveryRoute
    {
        $route = $this->routes->findWithRelations($routeId);
        if (! $route instanceof DeliveryRoute) {
            throw ValidationException::withMessages([
                'route_id' => __('Route not found.'),
            ]);
        }

        if ($route->status !== RouteStatus::Planned) {
            throw ValidationException::withMessages([
                'route_id' => __('Only planned routes can be started.'),
            ]);
        }

        if (! $route->vehicle->is_available) {
            throw ValidationException::withMessages([
                'route_id' => __('The assigned vehicle is not available.'),
            ]);
        }

        DB::transaction(function () use ($route): void {
            if ($route->comparison_batch_id) {
                $siblings = DeliveryRoute::query()
                    ->where('comparison_batch_id', $route->comparison_batch_id)
                    ->where('id', '!=', $route->id)
                    ->where('status', RouteStatus::Planned)
                    ->get();

                foreach ($siblings as $sibling) {
                    $this->forgetRouteCache($sibling->id);
                    $this->routes->deleteRoute($sibling);
                }
            }

            $this->routes->update($route, [
                'status' => RouteStatus::InProgress,
                'next_stop_sequence' => 1,
                'departure_at' => $route->departure_at ?? now(),
            ]);
        });

        $this->forgetRouteCache($routeId);

        return $this->routes->findWithRelations($routeId);
    }

    public function advanceNextStop(mixed $routeId): DeliveryRoute
    {
        $route = $this->routes->findWithRelations($routeId);
        if (! $route instanceof DeliveryRoute) {
            throw ValidationException::withMessages([
                'route_id' => __('Route not found.'),
            ]);
        }

        if ($route->status !== RouteStatus::InProgress) {
            throw ValidationException::withMessages([
                'route_id' => __('The route is not currently in progress.'),
            ]);
        }

        $next = $route->next_stop_sequence;
        if ($next === null) {
            throw ValidationException::withMessages([
                'route_id' => __('There is no active stop to advance.'),
            ]);
        }

        $stop = $route->routeStops->firstWhere('sequence', $next);
        if (! $stop) {
            throw ValidationException::withMessages([
                'route_id' => __('The current stop could not be resolved.'),
            ]);
        }

        DB::transaction(function () use ($route, $stop, $next): void {
            $this->orders->markStatus($stop->order, OrderStatus::Delivered);

            $maxSequence = (int) $route->routeStops->max('sequence');

            if ($next >= $maxSequence) {
                $this->routes->update($route, [
                    'status' => RouteStatus::Completed,
                    'next_stop_sequence' => null,
                ]);
            } else {
                $this->routes->update($route, [
                    'next_stop_sequence' => $next + 1,
                ]);
            }
        });

        $this->forgetRouteCache($routeId);

        return $this->routes->findWithRelations($routeId);
    }

    public function completeRoute(mixed $routeId): DeliveryRoute
    {
        $route = $this->routes->findWithRelations($routeId);
        if (! $route instanceof DeliveryRoute) {
            throw ValidationException::withMessages([
                'route_id' => __('Route not found.'),
            ]);
        }

        DB::transaction(function () use ($route): void {
            foreach ($route->routeStops as $stop) {
                $this->orders->markStatus($stop->order, OrderStatus::Delivered);
            }

            $this->routes->update($route, [
                'status' => RouteStatus::Completed,
                'next_stop_sequence' => null,
            ]);
        });

        $this->forgetRouteCache($routeId);

        return $this->routes->findWithRelations($routeId);
    }

    public function findRouteForRead(mixed $routeId): ?DeliveryRoute
    {
        $key = $this->routeCacheKey($routeId);
        $cached = Cache::get($key);

        if ($cached instanceof DeliveryRoute) {
            return $cached;
        }

        $route = $this->routes->findWithRelations($routeId);

        if ($route instanceof DeliveryRoute) {
            Cache::put($key, $route, self::ROUTE_CACHE_TTL_SECONDS);
        }

        return $route;
    }

    public function forgetRouteCache(mixed $routeId): void
    {
        Cache::forget($this->routeCacheKey($routeId));
    }

    /**
     * @return Collection<int, DeliveryCenter>
     */
    private function resolveCenters(mixed $deliveryCenterId): Collection
    {
        if ($deliveryCenterId !== null) {
            $center = $this->centers->find($deliveryCenterId);
            if (! $center instanceof DeliveryCenter) {
                throw ValidationException::withMessages([
                    'delivery_center_id' => __('The selected delivery center is invalid.'),
                ]);
            }

            return collect([$center]);
        }

        return $this->centers->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function processCenter(DeliveryCenter $center, Carbon $departureAt): array
    {
        $pending = $this->orders->pendingForCenter($center->id);
        if ($pending->isEmpty()) {
            Log::info('route.generate.center.skip', [
                'delivery_center_id' => $center->id,
                'reason' => 'no_pending_orders',
            ]);

            return [];
        }

        $vehicles = $this->vehicles->availableForCenter($center->id);
        if ($vehicles->isEmpty()) {
            throw ValidationException::withMessages([
                'delivery_center_id' => __('No available vehicles exist for this delivery center.'),
            ]);
        }

        $this->assertCapacityCoversOrders($vehicles, $pending);

        $clusters = $this->clusterOrdersByVehicleCapacity(
            $pending,
            $vehicles,
            (float) $center->latitude,
            (float) $center->longitude
        );

        $comparisons = [];

        DB::transaction(function () use ($clusters, $center, $departureAt, $vehicles, &$comparisons): void {
            foreach ($clusters as $vehicleId => $bucket) {
                if ($bucket->isEmpty()) {
                    continue;
                }

                /** @var Vehicle $vehicle */
                $vehicle = $vehicles->firstWhere('id', $vehicleId);
                if ($bucket->count() > $vehicle->capacity) {
                    throw ValidationException::withMessages([
                        'delivery_center_id' => __('Vehicle capacity was exceeded while clustering orders.'),
                    ]);
                }

                $batchId = (string) Str::uuid();

                $distanceTour = (new RouteOptimizer((float) $center->latitude, (float) $center->longitude))
                    ->buildShortestDistanceTour($bucket);

                $timeTour = (new RouteOptimizer((float) $center->latitude, (float) $center->longitude))
                    ->buildFastestTimeTour($bucket, (float) $vehicle->average_speed, self::SERVICE_SECONDS_PER_STOP);

                $routeDistance = $this->persistOptimizedRoute(
                    $center,
                    $vehicle,
                    $distanceTour,
                    $departureAt,
                    OptimizationProfile::ShortestDistance,
                    $batchId
                );

                $routeTime = $this->persistOptimizedRoute(
                    $center,
                    $vehicle,
                    $timeTour,
                    $departureAt,
                    OptimizationProfile::FastestTime,
                    $batchId
                );

                $comparisons[] = [
                    'comparison_batch_id' => $batchId,
                    'delivery_center_id' => $center->id,
                    'vehicle_id' => $vehicle->id,
                    'shortest_distance_route' => $routeDistance->fresh(['deliveryCenter', 'vehicle', 'routeStops.order']),
                    'fastest_time_route' => $routeTime->fresh(['deliveryCenter', 'vehicle', 'routeStops.order']),
                ];

                $this->forgetRouteCache($routeDistance->id);
                $this->forgetRouteCache($routeTime->id);
            }
        });

        return $comparisons;
    }

    /**
     * @param  array<int, Order>  $orderedStops
     */
    private function persistOptimizedRoute(
        DeliveryCenter $center,
        Vehicle $vehicle,
        array $orderedStops,
        Carbon $departureAt,
        OptimizationProfile $profile,
        string $comparisonBatchId,
    ): DeliveryRoute {
        $optimizer = new RouteOptimizer((float) $center->latitude, (float) $center->longitude);
        $distanceKm = $optimizer->tourDistanceKm($orderedStops);

        $timing = (new RouteTimingCalculator)->compute(
            $departureAt,
            $orderedStops,
            (float) $center->latitude,
            (float) $center->longitude,
            (float) $vehicle->average_speed,
            self::SERVICE_SECONDS_PER_STOP,
        );

        // Fetch OSRM geometry
        $geometry = $this->fetchGeometry($center, $orderedStops);

        $route = $this->routes->create([
            'delivery_center_id' => $center->id,
            'vehicle_id' => $vehicle->id,
            'comparison_batch_id' => $comparisonBatchId,
            'optimization_profile' => $profile,
            'total_distance' => round($distanceKm, 3),
            'total_time' => $timing['total_seconds'],
            'status' => RouteStatus::Planned,
            'next_stop_sequence' => null,
            'departure_at' => $departureAt,
            'geometry' => $geometry,
        ]);

        foreach ($orderedStops as $index => $order) {
            $legKm = $timing['leg_distances_km'][$index] ?? 0.0;

            $route->routeStops()->create([
                'order_id' => $order->id,
                'sequence' => $index + 1,
                'distance_from_previous' => round((float) $legKm, 3),
                'estimated_arrival_time' => $timing['etas'][$index] ?? null,
            ]);

            $this->orders->markStatus($order, OrderStatus::Assigned);
        }

        return $route->fresh(['deliveryCenter', 'vehicle', 'routeStops.order']);
    }

    /**
     * @param  Collection<int, Vehicle>  $vehicles
     * @param  Collection<int, Order>  $orders
     */
    private function assertCapacityCoversOrders(Collection $vehicles, Collection $orders): void
    {
        $capacity = (int) $vehicles->sum('capacity');

        if ($capacity < $orders->count()) {
            throw ValidationException::withMessages([
                'delivery_center_id' => __('Combined vehicle capacity is insufficient for all pending orders.'),
            ]);
        }
    }

    /**
     * @param  Collection<int, Order>  $orders
     * @param  Collection<int, Vehicle>  $vehicles
     * @return array<int, Collection<int, Order>>
     */
    private function clusterOrdersByVehicleCapacity(
        Collection $orders,
        Collection $vehicles,
        float $depotLat,
        float $depotLon
    ): array {
        $sorted = $orders->sort(function (Order $a, Order $b) use ($depotLat, $depotLon) {
            if ($a->priority->rank() !== $b->priority->rank()) {
                return $b->priority->rank() <=> $a->priority->rank();
            }

            $angleA = atan2($a->latitude - $depotLat, $a->longitude - $depotLon);
            $angleB = atan2($b->latitude - $depotLat, $b->longitude - $depotLon);

            if ($angleA === $angleB) {
                return $a->id <=> $b->id;
            }

            return $angleA <=> $angleB;
        })->values();

        $buckets = [];
        $cursor = 0;

        foreach ($vehicles->sortBy('id')->values() as $vehicle) {
            $slice = $sorted->slice($cursor, $vehicle->capacity)->values();
            $cursor += $slice->count();
            $buckets[$vehicle->id] = $slice;
        }

        if ($cursor < $sorted->count()) {
            throw ValidationException::withMessages([
                'delivery_center_id' => __('Unable to assign every order without exceeding vehicle capacities.'),
            ]);
        }

        return $buckets;
    }

    private function routeCacheKey(mixed $routeId): string
    {
        return 'delivery_route:'.$routeId;
    }

    private function fetchGeometry(DeliveryCenter $center, array $stops): array
    {
        if (empty($stops)) {
            return [];
        }

        $points = collect([[ (float) $center->longitude, (float) $center->latitude ]])
            ->concat(collect($stops)->map(fn($s) => [ (float) $s->longitude, (float) $s->latitude ]))
            ->push([ (float) $center->longitude, (float) $center->latitude ])
            ->map(fn($p) => implode(',', $p))
            ->implode(';');

        try {
            $response = Http::get("https://router.project-osrm.org/route/v1/driving/{$points}", [
                'overview' => 'full',
                'geometries' => 'geojson',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (($data['code'] ?? '') === 'Ok' && !empty($data['routes'][0]['geometry']['coordinates'])) {
                    // Convert [lng, lat] to [lat, lng] for Leaflet
                    return array_map(fn($p) => [$p[1], $p[0]], $data['routes'][0]['geometry']['coordinates']);
                }
            }
        } catch (\Exception $e) {
            Log::error('route.osrm.failed', ['error' => $e->getMessage()]);
        }

        return [];
    }
}
