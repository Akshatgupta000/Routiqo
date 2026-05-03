<?php

namespace App\Repositories\Contracts;

use App\Models\DeliveryCenter;
use Illuminate\Support\Collection;

interface DeliveryCenterRepositoryInterface
{
    public function all(): Collection;

    public function find(mixed $id): ?DeliveryCenter;

    public function create(array $data): DeliveryCenter;
}
