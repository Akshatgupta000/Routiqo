<?php

namespace App\Repositories\Contracts;

use App\Models\DeliveryRoute;
use Illuminate\Support\Collection;

interface RouteRepositoryInterface
{
    public function all(): Collection;

    public function findWithRelations(mixed $id): ?DeliveryRoute;

    public function create(array $data): DeliveryRoute;

    public function update(DeliveryRoute $route, array $data): DeliveryRoute;

    public function deleteStops(DeliveryRoute $route): void;

    /**
     * @return Collection<int, DeliveryRoute>
     */
    public function plannedRoutesForCenter(mixed $deliveryCenterId): Collection;

    public function deleteRoute(DeliveryRoute $route): void;
}
