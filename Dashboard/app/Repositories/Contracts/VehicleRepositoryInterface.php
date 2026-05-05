<?php

namespace App\Repositories\Contracts;

use App\Models\Vehicle;
use Illuminate\Support\Collection;

interface VehicleRepositoryInterface
{
    public function all(mixed $deliveryCenterId = null): Collection;

    public function forCenter(mixed $deliveryCenterId): Collection;

    public function availableForCenter(mixed $deliveryCenterId): Collection;

    public function find(mixed $id): ?Vehicle;

    public function create(array $data): Vehicle;

    public function update(Vehicle $vehicle, array $data): Vehicle;

    public function delete(Vehicle $vehicle): void;
}
