<?php

namespace App\Services;

use App\Enums\OrderPriority;
use App\Enums\OrderStatus;
use App\Helpers\DistanceHelper;
use App\Models\DeliveryCenter;
use App\Models\Order;
use App\Repositories\Contracts\DeliveryCenterRepositoryInterface;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly DeliveryCenterRepositoryInterface $centers,
    ) {}

    public function createOrder(array $payload): Order
    {
        $center = $this->resolveNearestCenter(
            (float) $payload['latitude'],
            (float) $payload['longitude']
        );

        $priority = isset($payload['priority'])
            ? OrderPriority::from($payload['priority'])
            : OrderPriority::Medium;

        $data = [
            'address' => $payload['address'],
            'latitude' => $payload['latitude'],
            'longitude' => $payload['longitude'],
            'delivery_center_id' => $center->id,
            'status' => OrderStatus::Pending,
            'priority' => $priority,
        ];

        return $this->orders->create($data);
    }

    public function updateOrderStatus(Order $order, string $status): Order
    {
        $next = OrderStatus::from($status);

        if ($order->status === OrderStatus::Delivered && $next !== OrderStatus::Delivered) {
            throw ValidationException::withMessages([
                'status' => __('Delivered orders cannot be reverted.'),
            ]);
        }

        return $this->orders->update($order, ['status' => $next]);
    }

    private function resolveNearestCenter(float $latitude, float $longitude): DeliveryCenter
    {
        /** @var Collection<int, DeliveryCenter> $centers */
        $centers = $this->centers->all();

        if ($centers->isEmpty()) {
            throw ValidationException::withMessages([
                'latitude' => __('No delivery centers are configured.'),
            ]);
        }

        return $centers->sortBy(function (DeliveryCenter $center) use ($latitude, $longitude) {
            return DistanceHelper::kmBetween(
                $latitude,
                $longitude,
                (float) $center->latitude,
                (float) $center->longitude
            );
        })->first();
    }
}
