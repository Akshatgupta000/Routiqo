<?php

namespace Tests\Feature;

use App\Models\DeliveryCenter;
use App\Models\Order;
use App\Models\Vehicle;
use App\Models\DeliveryRoute;
use App\Models\RouteStop;
use App\Enums\OrderStatus;
use App\Enums\OrderPriority;
use App\Services\RouteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Carbon\Carbon;

class RouteGenerationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_route_generation_fails_with_no_orders(): void
    {
        $center = DeliveryCenter::factory()->create();
        Vehicle::factory()->create(['delivery_center_id' => $center->id, 'capacity' => 10]);

        $response = $this->postJson('/api/routes/generate', [
            'delivery_center_id' => (string) $center->id,
            'date' => now()->format('Y-m-d'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['delivery_center_id']);
    }

    public function test_route_generation_fails_with_no_vehicles(): void
    {
        $center = DeliveryCenter::factory()->create();
        Order::factory()->count(5)->create(['delivery_center_id' => $center->id, 'status' => OrderStatus::Pending]);

        $response = $this->postJson('/api/routes/generate', [
            'delivery_center_id' => (string) $center->id,
            'date' => now()->format('Y-m-d'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['delivery_center_id']);
    }

    public function test_route_is_generated_successfully_with_correct_sequences(): void
    {
        $center = DeliveryCenter::factory()->create([
            'latitude' => 34.0522,
            'longitude' => -118.2437,
        ]);
        
        $vehicle = Vehicle::factory()->create([
            'delivery_center_id' => $center->id,
            'capacity' => 10,
        ]);

        $orders = Order::factory()->count(5)->create([
            'delivery_center_id' => $center->id,
            'status' => OrderStatus::Pending,
        ]);

        $response = $this->postJson('/api/routes/generate', [
            'delivery_center_id' => (string) $center->id,
            'date' => now()->format('Y-m-d'),
        ]);

        $response->assertStatus(201);
        
        // Assert orders are assigned
        foreach ($orders as $order) {
            $this->assertEquals(OrderStatus::Assigned, $order->fresh()->status);
        }

        // Verify route contains all orders and no duplicates
        $routes = DeliveryRoute::where('delivery_center_id', $center->id)->get();
        $this->assertNotEmpty($routes);
        
        // Take the shortest distance route for validation
        $route = $routes->firstWhere('optimization_profile', 'shortest_distance');
        
        $stops = $route->routeStops()->orderBy('sequence')->get();
        
        $this->assertCount(5, $stops);
        
        $orderIdsInRoute = $stops->pluck('order_id')->toArray();
        $expectedOrderIds = $orders->pluck('id')->toArray();
        
        sort($orderIdsInRoute);
        sort($expectedOrderIds);
        
        $this->assertEquals($expectedOrderIds, $orderIdsInRoute);
        
        // Verify stops are stored in correct sequence starting from 1
        $sequences = $stops->pluck('sequence')->toArray();
        $this->assertEquals([1, 2, 3, 4, 5], $sequences);
    }

    public function test_multi_vehicle_distribution_respects_capacity(): void
    {
        $center = DeliveryCenter::factory()->create();
        
        // 2 vehicles with capacity 5 each
        Vehicle::factory()->count(2)->create([
            'delivery_center_id' => $center->id,
            'capacity' => 5,
        ]);

        // 8 orders (should distribute across both vehicles)
        Order::factory()->count(8)->create([
            'delivery_center_id' => $center->id,
            'status' => OrderStatus::Pending,
        ]);

        $response = $this->postJson('/api/routes/generate', [
            'delivery_center_id' => (string) $center->id,
            'date' => now()->format('Y-m-d'),
        ]);

        $response->assertStatus(201);

        // We should have generated routes for both vehicles. We look at a specific comparison profile.
        $routes = DeliveryRoute::where('delivery_center_id', $center->id)
            ->where('optimization_profile', 'shortest_distance')
            ->get();
            
        $this->assertCount(2, $routes);
        
        // Verify no vehicle exceeded capacity
        foreach ($routes as $route) {
            $this->assertLessThanOrEqual(5, $route->routeStops()->count());
            $this->assertGreaterThan(0, $route->routeStops()->count());
        }

        $totalStops = $routes->sum(fn ($r) => $r->routeStops()->count());
        $this->assertEquals(8, $totalStops);
    }

    public function test_priority_handling_assigns_high_priority_first(): void
    {
        $center = DeliveryCenter::factory()->create([
            'latitude' => 0.0,
            'longitude' => 0.0,
        ]);
        
        Vehicle::factory()->create([
            'delivery_center_id' => $center->id,
            'capacity' => 10,
        ]);

        // Create 2 orders far away, one is high priority
        $lowPriority = Order::factory()->create([
            'delivery_center_id' => $center->id,
            'status' => OrderStatus::Pending,
            'priority' => OrderPriority::Normal,
            'latitude' => 10.0,
            'longitude' => 10.0,
        ]);
        
        $highPriority = Order::factory()->create([
            'delivery_center_id' => $center->id,
            'status' => OrderStatus::Pending,
            'priority' => OrderPriority::Priority,
            'latitude' => 10.0, // Same location to avoid distance biasing the nearest neighbor
            'longitude' => 10.0,
        ]);

        $response = $this->postJson('/api/routes/generate', [
            'delivery_center_id' => (string) $center->id,
            'date' => now()->format('Y-m-d'),
        ]);

        $response->assertStatus(201);
        
        $route = DeliveryRoute::where('delivery_center_id', $center->id)
            ->where('optimization_profile', 'shortest_distance')
            ->first();
            
        $stops = $route->routeStops()->orderBy('sequence')->get();
        
        // High priority should be processed and appear earlier in the sequence when distances are similar
        $highSeq = $stops->where('order_id', $highPriority->id)->first()->sequence;
        $lowSeq = $stops->where('order_id', $lowPriority->id)->first()->sequence;
        
        $this->assertLessThan($lowSeq, $highSeq);
    }
}
