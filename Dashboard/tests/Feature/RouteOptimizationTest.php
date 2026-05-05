<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Enums\OrderPriority;
use App\Helpers\RouteOptimizer;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RouteOptimizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_nearest_neighbor_produces_valid_sequence(): void
    {
        $optimizer = new RouteOptimizer(0.0, 0.0); // Depot at origin

        // Order 1 is at (0, 1), distance = 1
        $order1 = Order::factory()->make(['id' => 1, 'latitude' => 1.0, 'longitude' => 0.0, 'priority' => OrderPriority::Normal]);
        // Order 2 is at (0, 3), distance = 3
        $order2 = Order::factory()->make(['id' => 2, 'latitude' => 3.0, 'longitude' => 0.0, 'priority' => OrderPriority::Normal]);
        // Order 3 is at (0, 10), distance = 10
        $order3 = Order::factory()->make(['id' => 3, 'latitude' => 10.0, 'longitude' => 0.0, 'priority' => OrderPriority::Normal]);

        // Unordered collection
        $orders = collect([$order3, $order1, $order2]);

        $tour = $optimizer->buildShortestDistanceTour($orders);

        $this->assertCount(3, $tour);
        // It should start from depot (0,0) -> order1 (1,0) -> order2 (3,0) -> order3 (10,0)
        $this->assertEquals(1, $tour[0]->id);
        $this->assertEquals(2, $tour[1]->id);
        $this->assertEquals(3, $tour[2]->id);
    }

    public function test_total_distance_is_positive_and_logical(): void
    {
        $optimizer = new RouteOptimizer(0.0, 0.0);
        $order1 = Order::factory()->make(['id' => 1, 'latitude' => 1.0, 'longitude' => 0.0, 'priority' => OrderPriority::Normal]);
        $order2 = Order::factory()->make(['id' => 2, 'latitude' => 3.0, 'longitude' => 0.0, 'priority' => OrderPriority::Normal]);

        $orders = collect([$order1, $order2]);
        $tour = $optimizer->buildShortestDistanceTour($orders);

        // Depot -> Order 1 -> Order 2 -> Depot
        // (0,0) to (1,0) = ~111km
        // (1,0) to (3,0) = ~222km
        // (3,0) to (0,0) = ~333km
        // Total should be around 666km
        
        $distance = $optimizer->tourDistanceKm($tour);
        
        $this->assertGreaterThan(0, $distance);
        $this->assertGreaterThan(600, $distance); // roughly checking logic
    }

    public function test_route_improves_after_optimization(): void
    {
        $optimizer = new RouteOptimizer(0.0, 0.0);
        
        // Intentionally create a crossing scenario where an unoptimized sequence is worse
        // A square pattern: (1,1), (-1,1), (-1,-1), (1,-1)
        $o1 = Order::factory()->make(['id' => 1, 'latitude' => 1.0, 'longitude' => 1.0, 'priority' => OrderPriority::Normal]);
        $o2 = Order::factory()->make(['id' => 2, 'latitude' => -1.0, 'longitude' => 1.0, 'priority' => OrderPriority::Normal]);
        $o3 = Order::factory()->make(['id' => 3, 'latitude' => -1.0, 'longitude' => -1.0, 'priority' => OrderPriority::Normal]);
        $o4 = Order::factory()->make(['id' => 4, 'latitude' => 1.0, 'longitude' => -1.0, 'priority' => OrderPriority::Normal]);
        
        // Bad sequence: Crosses itself
        $badTour = [$o1, $o3, $o2, $o4];
        $badDistance = $optimizer->tourDistanceKm($badTour);
        
        $orders = collect([$o1, $o3, $o2, $o4]);
        $optimizedTour = $optimizer->buildShortestDistanceTour($orders);
        $optimizedDistance = $optimizer->tourDistanceKm($optimizedTour);
        
        // The 2-opt or nearest neighbor should untangle the path and have a lower distance
        $this->assertLessThanOrEqual($badDistance, $optimizedDistance);
    }
}
