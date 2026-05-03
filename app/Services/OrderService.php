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
        private readonly GeocodingService $geocoding,
    ) {}

    public function createOrder(array $payload): Order
    {
        $lat = $payload['latitude'] ?? null;
        $lng = $payload['longitude'] ?? null;
        $address = $payload['address'];

        if ($lat === null || $lng === null) {
            $coords = $this->geocoding->geocode($address);
            $lat = $coords['lat'];
            $lng = $coords['lng'];
            $address = $coords['display_name'];
        }

        $priority = isset($payload['priority'])
            ? OrderPriority::from($payload['priority'])
            : OrderPriority::Medium;

        $data = [
            'address' => $address,
            'latitude' => $lat,
            'longitude' => $lng,
            'status' => OrderStatus::Pending,
            'priority' => $priority,
        ];

        return $this->orders->create($data);
    }

    public function assignOrder(Order $order): Order
    {
        if ($order->status !== OrderStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => __('Order is already assigned or processed.'),
            ]);
        }

        $center = $this->resolveNearestCenter(
            (float) $order->latitude,
            (float) $order->longitude
        );

        // Find available vehicle with lowest load
        $vehicle = \App\Models\Vehicle::query()
            ->where('delivery_center_id', $center->id)
            ->where('is_available', true)
            ->orderBy('current_load', 'asc')
            ->first();

        if (!$vehicle) {
             throw ValidationException::withMessages([
                'vehicle_id' => [
                    'code' => 'no_vehicle',
                    'message' => __('No available vehicles at the nearest delivery center (:center).', ['center' => $center->name]),
                    'suggestion' => 'create_vehicle',
                    'center_id' => $center->id
                ],
            ]);
        }

        // Update order
        $order = $this->orders->update($order, [
            'delivery_center_id' => $center->id,
            'vehicle_id' => $vehicle->id,
            'status' => OrderStatus::Assigned,
        ]);

        // Update vehicle: set to busy
        $vehicle->update([
            'is_available' => false,
            'current_load' => 1
        ]);

        return $order;
    }

    public function updateOrderStatus(Order $order, string $status): Order
    {
        $next = OrderStatus::from($status);

        if ($order->status === OrderStatus::Delivered && $next !== OrderStatus::Delivered) {
            throw ValidationException::withMessages([
                'status' => __('Delivered orders cannot be reverted.'),
            ]);
        }

        $order = $this->orders->update($order, ['status' => $next]);

        // If delivered, release the vehicle
        if ($next === OrderStatus::Delivered && $order->vehicle_id) {
            $vehicle = \App\Models\Vehicle::find($order->vehicle_id);
            if ($vehicle) {
                $vehicle->update([
                    'is_available' => true,
                    'current_load' => 0
                ]);
            }
        }

        return $order;
    }

    private function resolveNearestCenter(float $latitude, float $longitude): DeliveryCenter
    {
        /** @var Collection<int, DeliveryCenter> $centers */
        $centers = $this->centers->all();

        if ($centers->isEmpty()) {
            throw ValidationException::withMessages([
                'address' => [
                    'code' => 'no_center',
                    'message' => __('No delivery centers available.'),
                    'suggestion' => 'create_center',
                    'lat' => $latitude,
                    'lng' => $longitude
                ],
            ]);
        }

        $nearby = $centers->map(function (DeliveryCenter $center) use ($latitude, $longitude) {
            $dist = DistanceService::calculate(
                $latitude,
                $longitude,
                (float) $center->latitude,
                (float) $center->longitude
            );
            $center->temp_distance = $dist;

            return $center;
        })->filter(fn ($c) => $c->temp_distance <= 10.0);

        if ($nearby->isEmpty()) {
            $minDist = $centers->min('temp_distance');
            throw ValidationException::withMessages([
                'address' => [
                    'code' => 'no_center',
                    'message' => __('Delivery address is too far (nearest center is :dist km away).', ['dist' => round($minDist, 1)]),
                    'suggestion' => 'create_center',
                    'lat' => $latitude,
                    'lng' => $longitude
                ],
            ]);
        }

        return $nearby->sortBy('temp_distance')->first();
    }
}
