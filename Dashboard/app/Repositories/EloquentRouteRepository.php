<?php

namespace App\Repositories;

use App\Enums\RouteStatus;
use App\Models\DeliveryRoute;
use App\Repositories\Contracts\RouteRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentRouteRepository implements RouteRepositoryInterface
{
    public function all(): Collection
    {
        return DeliveryRoute::query()
            ->with(['deliveryCenter', 'vehicle', 'routeStops.order'])
            ->orderByDesc('id')
            ->get();
    }

    public function findWithRelations(mixed $id): ?DeliveryRoute
    {
        return DeliveryRoute::query()
            ->with(['deliveryCenter', 'vehicle', 'routeStops.order'])
            ->find($id);
    }

    public function create(array $data): DeliveryRoute
    {
        return DeliveryRoute::query()->create($data);
    }

    public function update(DeliveryRoute $route, array $data): DeliveryRoute
    {
        $route->update($data);

        return $route->fresh();
    }

    public function deleteStops(DeliveryRoute $route): void
    {
        $route->routeStops()->delete();
    }

    public function plannedRoutesForCenter(mixed $deliveryCenterId): Collection
    {
        return DeliveryRoute::query()
            ->where('delivery_center_id', $deliveryCenterId)
            ->where('status', RouteStatus::Planned)
            ->with('routeStops')
            ->get();
    }

    public function deleteRoute(DeliveryRoute $route): void
    {
        $route->delete();
    }
}
