<?php

namespace Tests\Feature;

use App\Models\DeliveryCenter;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class VehicleTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_can_create_vehicle(): void
    {
        $center = DeliveryCenter::factory()->create();

        $payload = [
            'name' => 'Test Van 1',
            'capacity' => 15,
            'average_speed' => 45.5,
            'delivery_center_id' => $center->id,
        ];

        $response = $this->postJson('/api/vehicles', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'capacity', 'average_speed', 'is_available', 'delivery_center_id']
            ]);

        $this->assertDatabaseHas('vehicles', [
            'name' => 'Test Van 1',
            'capacity' => 15,
            'is_available' => 1,
        ]);
    }

    public function test_cannot_create_vehicle_with_invalid_capacity(): void
    {
        $center = DeliveryCenter::factory()->create();

        $payload = [
            'name' => 'Test Van 2',
            'capacity' => 0, // Capacity must be > 0
            'average_speed' => 45.5,
            'delivery_center_id' => $center->id,
        ];

        $response = $this->postJson('/api/vehicles', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['capacity']);
    }

    public function test_can_fetch_vehicles(): void
    {
        Vehicle::factory()->count(4)->create();

        $response = $this->getJson('/api/vehicles');

        $response->assertStatus(200)
            ->assertJsonCount(4, 'data');
    }
}
