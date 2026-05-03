<?php

namespace App\Repositories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function paginateWithFilters(int $perPage, ?OrderStatus $status = null): LengthAwarePaginator
    {
        $query = Order::query()->with('deliveryCenter')->orderByDesc('_id');

        if ($status instanceof OrderStatus) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }

    public function all(): Collection
    {
        return Order::query()->with('deliveryCenter')->orderByDesc('_id')->get();
    }

    public function find(int $id): ?Order
    {
        return Order::query()->find($id);
    }

    public function create(array $data): Order
    {
        return Order::query()->create($data);
    }

    public function update(Order $order, array $data): Order
    {
        $order->update($data);

        return $order->fresh();
    }

    public function pendingForCenter(int $deliveryCenterId): Collection
    {
        return Order::query()
            ->where('delivery_center_id', $deliveryCenterId)
            ->where('status', OrderStatus::Pending)
            ->orderBy('priority')
            ->orderBy('_id')
            ->get();
    }

    public function markStatus(Order $order, OrderStatus $status): void
    {
        $order->update(['status' => $status]);
    }

    public function revertAssignedToPending(array $orderIds): void
    {
        if ($orderIds === []) {
            return;
        }

        Order::query()
            ->whereIn('id', $orderIds)
            ->where('status', OrderStatus::Assigned)
            ->update(['status' => OrderStatus::Pending]);
    }
}
