<?php

namespace App\Repositories;

use App\Models\Vehicle;
use App\Repositories\Contracts\VehicleRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentVehicleRepository implements VehicleRepositoryInterface
{
    public function all(?int $deliveryCenterId = null): Collection
    {
        $query = Vehicle::query()->with('deliveryCenter')->orderBy('id');

        if ($deliveryCenterId !== null) {
            $query->where('delivery_center_id', $deliveryCenterId);
        }

        return $query->get();
    }

    public function forCenter(int $deliveryCenterId): Collection
    {
        return Vehicle::query()
            ->where('delivery_center_id', $deliveryCenterId)
            ->orderBy('id')
            ->get();
    }

    public function availableForCenter(int $deliveryCenterId): Collection
    {
        return Vehicle::query()
            ->where('delivery_center_id', $deliveryCenterId)
            ->where('is_available', true)
            ->orderBy('id')
            ->get();
    }

    public function find(int $id): ?Vehicle
    {
        return Vehicle::query()->find($id);
    }

    public function create(array $data): Vehicle
    {
        return Vehicle::query()->create($data);
    }

    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        $vehicle->update($data);

        return $vehicle->fresh();
    }
}
