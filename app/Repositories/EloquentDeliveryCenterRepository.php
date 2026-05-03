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
}
