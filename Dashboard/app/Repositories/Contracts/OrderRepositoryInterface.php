<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use App\Enums\OrderStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface OrderRepositoryInterface
{
    public function paginateWithFilters(int $perPage, ?OrderStatus $status = null, ?string $date = null): LengthAwarePaginator;

    public function all(): Collection;

    public function find(mixed $id): ?Order;

    public function create(array $data): Order;

    public function update(Order $order, array $data): Order;

    public function delete(Order $order): void;

    public function pendingForCenter(mixed $deliveryCenterId): Collection;

    public function markStatus(Order $order, OrderStatus $status): void;

    /**
     * @param  array<int>  $orderIds
     */
    public function revertAssignedToPending(array $orderIds): void;

    public function pendingForCenterOnDate(mixed $deliveryCenterId, string $date): Collection;
}
