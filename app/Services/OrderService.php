<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\DeliveryCenter;
use App\Models\Order;
use App\Models\ServiceZone;
use App\Repositories\Contracts\DeliveryCenterRepositoryInterface;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly DeliveryCenterRepositoryInterface $centers,
        private readonly ServiceZoneService $zoneService
    ) {}

    public function createOrder(array $data): Order
    {
        $center = $this->resolveNearestCenter((float) $data['latitude'], (float) $data['longitude']);
        
        $data['delivery_center_id'] = $center?->id;
        $data['status'] = $center ? OrderStatus::Assigned : OrderStatus::Pending;

        return $this->orders->create($data);
    }

    public function updateOrderStatus(Order $order, string $status): Order
    {
        $statusEnum = OrderStatus::from($status);
        
        return $this->orders->update($order, [
            'status' => $statusEnum,
        ]);
    }

    public function assignOrder(Order|string $order): Order
    {
        if (is_string($order)) {
            $order = $this->orders->find($order);
        }
        abort_if(! $order, 404);

        $center = $this->resolveNearestCenter((float) $order->latitude, (float) $order->longitude);
        if (! $center) {
            throw ValidationException::withMessages([
                'address' => [
                    'message' => 'No nearby delivery center found within 10km.',
                    'code' => 'out_of_range'
                ],
            ]);
        }

        return $this->orders->update($order, [
            'delivery_center_id' => $center->id,
            'status' => OrderStatus::Assigned,
        ]);
    }

    private function resolveNearestCenter(float $latitude, float $longitude): ?DeliveryCenter
    {
        $centers = DeliveryCenter::all();
        if ($centers->isEmpty()) return null;

        $nearest = $centers->map(function ($c) use ($latitude, $longitude) {
            $c->dist = \App\Helpers\DistanceHelper::kmBetween($latitude, $longitude, $c->latitude, $c->longitude);
            return $c;
        })->sortBy('dist')->first();

        if ($nearest && $nearest->dist <= 10.0) {
            return $nearest;
        }

        return null;
    }
}
