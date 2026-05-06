<?php

namespace App\Repositories;

use App\Models\DeliveryCenter;
use App\Repositories\Contracts\DeliveryCenterRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentDeliveryCenterRepository implements DeliveryCenterRepositoryInterface
{
    public function all(): Collection
    {
        return DeliveryCenter::query()->orderBy('name')->get();
    }

    public function find(mixed $id): ?DeliveryCenter
    {
        return DeliveryCenter::query()->find($id);
    }

    public function create(array $data): DeliveryCenter
    {
        return DeliveryCenter::query()->create($data);
    }

    public function update(DeliveryCenter $center, array $data): DeliveryCenter
    {
        $center->update($data);

        return $center->fresh();
    }

    public function delete(DeliveryCenter $center): void
    {
        $center->delete();
    }
}
