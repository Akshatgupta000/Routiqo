<?php

namespace App\Services;

use App\Enums\OrderPriority;
use App\Enums\OrderStatus;
use App\Models\DeliveryCenter;
use App\Models\Order;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    /**
     * Initialize a new dashboard for a user with default data.
     */
    public function initializeForUser(User $user): void
    {
        try {
            // Create a default Delivery Center
            $hub = DeliveryCenter::create([
                'user_id' => $user->id,
                'name' => 'Brooklyn Main Hub',
                'latitude' => 40.6782,
                'longitude' => -73.9442,
            ]);

            // Create some default Vehicles
            $vehicles = [
                ['name' => 'Prime Van 01', 'capacity' => 15, 'average_speed' => 25.0],
                ['name' => 'Prime Van 02', 'capacity' => 12, 'average_speed' => 28.0],
                ['name' => 'Express Truck 01', 'capacity' => 25, 'average_speed' => 22.0],
            ];

            foreach ($vehicles as $v) {
                Vehicle::create([
                    'user_id' => $user->id,
                    'delivery_center_id' => $hub->id,
                    'name' => $v['name'],
                    'capacity' => $v['capacity'],
                    'average_speed' => $v['average_speed'],
                    'is_available' => true,
                ]);
            }

            // Create some initial Orders
            $orderPoints = [
                ['addr' => '123 Prospect Park', 'lat' => 40.6602, 'lng' => -73.9690],
                ['addr' => '456 Atlantic Ave', 'lat' => 40.6840, 'lng' => -73.9776],
                ['addr' => '789 Bedford Ave', 'lat' => 40.6930, 'lng' => -73.9550],
                ['addr' => '321 Flatbush Ave', 'lat' => 40.6750, 'lng' => -73.9700],
                ['addr' => '654 Grand St', 'lat' => 40.7110, 'lng' => -73.9480],
            ];

            $priorities = OrderPriority::cases();

            foreach ($orderPoints as $i => $point) {
                Order::create([
                    'user_id' => $user->id,
                    'delivery_center_id' => $hub->id,
                    'address' => $point['addr'],
                    'latitude' => $point['lat'],
                    'longitude' => $point['lng'],
                    'status' => OrderStatus::Pending,
                    'priority' => $priorities[$i % count($priorities)],
                ]);
            }

            Log::info("Dashboard initialized for user: {$user->email}");
        } catch (\Exception $e) {
            Log::error("Failed to initialize dashboard for user {$user->id}: " . $e->getMessage());
            // We don't throw here to ensure registration doesn't fail if seeding fails,
            // but in a production "error free" system, we might want to handle this differently.
            // For now, logging is enough as it's an "optional" first-run experience.
        }
    }
}
