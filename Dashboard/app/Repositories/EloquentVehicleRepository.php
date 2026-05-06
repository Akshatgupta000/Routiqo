<?php

namespace App\Repositories;

use App\Models\Vehicle;
use App\Repositories\Contracts\VehicleRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentVehicleRepository implements VehicleRepositoryInterface
{
    public function all(mixed $deliveryCenterId = null): Collection
    {
        $query = Vehicle::query()->with('deliveryCenter')->orderBy('id');

        if ($deliveryCenterId !== null) {
            $query->where(function ($q) use ($deliveryCenterId) {
                $q->where('delivery_center_id', $deliveryCenterId)
                  ->orWhereNull('delivery_center_id');
            });
        }

        return $query->get();
    }

    public function forCenter(mixed $deliveryCenterId): Collection
    {
        return Vehicle::query()
            ->where('delivery_center_id', $deliveryCenterId)
            ->orderBy('id')
            ->get();
    }

    public function availableForCenter(mixed $deliveryCenterId): Collection
    {
        return Vehicle::query()
            ->where('delivery_center_id', $deliveryCenterId)
            ->where('is_available', true)
            ->orderBy('id')
            ->get();
    }

    public function find(mixed $id): ?Vehicle
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

    public function delete(Vehicle $vehicle): void
    {
        $vehicle->delete();
    }
}
