<?php

namespace Database\Seeders;

use App\Enums\OrderPriority;
use App\Enums\OrderStatus;
use App\Models\DeliveryCenter;
use App\Models\Order;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class RoutePlanningSeeder extends Seeder
{
    public function run(): void
    {
        $brooklyn = DeliveryCenter::query()->create([
            'name' => 'Brooklyn Distribution Hub',
            'latitude' => 40.6782,
            'longitude' => -73.9442,
        ]);

        $queens = DeliveryCenter::query()->create([
            'name' => 'Queens Fulfillment Center',
            'latitude' => 40.7282,
            'longitude' => -73.7949,
        ]);

        $priorities = OrderPriority::cases();

        foreach (
            [
                ['name' => 'Van BK-01', 'capacity' => 8, 'speed' => 28.0, 'center' => $brooklyn],
                ['name' => 'Van BK-02', 'capacity' => 7, 'speed' => 24.0, 'center' => $brooklyn],
                ['name' => 'Van BK-03', 'capacity' => 6, 'speed' => 32.0, 'center' => $brooklyn],
                ['name' => 'Truck QN-01', 'capacity' => 10, 'speed' => 22.0, 'center' => $queens],
                ['name' => 'Truck QN-02', 'capacity' => 9, 'speed' => 26.0, 'center' => $queens],
            ] as $vehicle
        ) {
            Vehicle::query()->create([
                'name' => $vehicle['name'],
                'capacity' => $vehicle['capacity'],
                'average_speed' => $vehicle['speed'],
                'is_available' => true,
                'delivery_center_id' => $vehicle['center']->id,
            ]);
        }

        $brooklynPoints = [
            [40.7219, -73.9614], [40.7023, -73.9935], [40.6965, -73.9969], [40.6719, -73.9637],
            [40.7175, -73.9544], [40.6983, -73.9714], [40.7028, -73.9894], [40.7180, -73.9400],
            [40.7148, -73.9617], [40.6830, -73.9687], [40.6910, -73.9420], [40.7090, -73.9780],
            [40.7055, -73.9500], [40.7120, -73.9850], [40.6880, -73.9550],
        ];

        foreach ($brooklynPoints as $i => $coords) {
            Order::query()->create([
                'address' => 'Brooklyn delivery '.($i + 1),
                'latitude' => $coords[0] + (mt_rand(-20, 20) / 100000),
                'longitude' => $coords[1] + (mt_rand(-20, 20) / 100000),
                'delivery_center_id' => $brooklyn->id,
                'status' => OrderStatus::Pending,
                'priority' => $priorities[$i % 3],
            ]);
        }

        $queensPoints = [
            [40.7431, -73.9349], [40.7512, -73.9405], [40.7350, -73.8690], [40.7600, -73.8300],
            [40.7450, -73.9000], [40.7280, -73.9200], [40.7700, -73.8800],
        ];

        foreach ($queensPoints as $i => $coords) {
            Order::query()->create([
                'address' => 'Queens delivery '.($i + 1),
                'latitude' => $coords[0] + (mt_rand(-20, 20) / 100000),
                'longitude' => $coords[1] + (mt_rand(-20, 20) / 100000),
                'delivery_center_id' => $queens->id,
                'status' => OrderStatus::Pending,
                'priority' => $priorities[($i + 1) % 3],
            ]);
        }
    }
}
