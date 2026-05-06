<?php

namespace Tests\Feature;

use App\Models\DeliveryCenter;
use App\Models\Order;
use App\Enums\OrderStatus;
use App\Enums\OrderPriority;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_can_create_order(): void
    {
        $center = DeliveryCenter::factory()->create();

        $payload = [
            'address' => '123 Test St',
            'latitude' => 34.0522,
            'longitude' => -118.2437,
            'priority' => OrderPriority::Priority->value,
            'delivery_date' => now()->format('Y-m-d'),
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'address', 'latitude', 'longitude', 'delivery_center_id', 'status', 'priority']
            ]);

        $this->assertDatabaseHas('orders', [
            'address' => '123 Test St',
            'status' => OrderStatus::Pending->value,
        ]);
    }

    public function test_order_gets_assigned_to_nearest_delivery_center(): void
    {
        $farCenter = DeliveryCenter::factory()->create([
            'latitude' => 40.7128, // NY
            'longitude' => -74.0060,
        ]);

        $nearCenter = DeliveryCenter::factory()->create([
            'latitude' => 34.0500, // LA
            'longitude' => -118.2400,
        ]);

        $payload = [
            'address' => 'Near LA',
            'latitude' => 34.0522,
            'longitude' => -118.2437,
            'priority' => 'normal',
            'delivery_date' => now()->format('Y-m-d'),
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        $this->assertEquals($nearCenter->id, $response->json('data.delivery_center_id'));
    }

    public function test_validation_fails_for_invalid_input(): void
    {
        $payload = [
            'address' => '', // Required
            'latitude' => 'invalid', // Must be numeric
            'longitude' => -118.2437,
            'priority' => 'extreme', // Not a valid enum
            'delivery_date' => now()->format('Y-m-d'),
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['address', 'latitude', 'priority']);
    }

    public function test_can_fetch_orders(): void
    {
        Order::factory()->count(5)->create();

        $response = $this->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data'); // Assuming pagination is used, usually wraps in 'data'
    }
}
