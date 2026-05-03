<?php

namespace App\Repositories\Contracts;

use App\Models\Vehicle;
use Illuminate\Support\Collection;

interface VehicleRepositoryInterface
{
    public function all(?int $deliveryCenterId = null): Collection;

    public function forCenter(int $deliveryCenterId): Collection;

    public function availableForCenter(int $deliveryCenterId): Collection;

    public function find(int $id): ?Vehicle;

    public function create(array $data): Vehicle;

    public function update(Vehicle $vehicle, array $data): Vehicle;
}
