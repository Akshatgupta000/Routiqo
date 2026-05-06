<?php

namespace Database\Seeders;

use App\Models\DeliveryCenter;
use App\Models\Order;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed 2 Delivery Centers
        $centers = DeliveryCenter::factory()->count(2)->create();

        foreach ($centers as $center) {
            // Seed 3 Vehicles per Center (Total 6)
            Vehicle::factory()->count(3)->create([
                'delivery_center_id' => $center->id,
                'capacity' => 10, // Predictable capacity for testing
            ]);

            // Seed 10-20 Orders per Center
            Order::factory()->count(rand(10, 20))->create([
                'delivery_center_id' => $center->id,
                // Generate coordinates near the center
                'latitude' => $center->latitude + (rand(-100, 100) / 10000),
                'longitude' => $center->longitude + (rand(-100, 100) / 10000),
            ]);
        }
    }
}
