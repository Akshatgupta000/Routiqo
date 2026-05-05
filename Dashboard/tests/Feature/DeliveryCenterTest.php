<?php

namespace Tests\Feature;

use App\Models\DeliveryCenter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class DeliveryCenterTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_can_create_a_center(): void
    {
        $payload = [
            'name' => 'Main Hub',
            'latitude' => 34.0522,
            'longitude' => -118.2437,
        ];

        $response = $this->postJson('/api/centers', $payload);
        $response->dump();

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'latitude', 'longitude']
            ]);

        $this->assertDatabaseHas('delivery_centers', [
            'name' => 'Main Hub',
            'latitude' => 34.0522,
            'longitude' => -118.2437,
        ]);
    }

    public function test_validation_fails_for_invalid_coordinates(): void
    {
        $payload = [
            'name' => 'Invalid Hub',
            'latitude' => 100, // Invalid latitude (> 90)
            'longitude' => -118.2437,
        ];

        $response = $this->postJson('/api/centers', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['latitude']);
    }

    public function test_can_fetch_all_centers(): void
    {
        DeliveryCenter::factory()->count(3)->create();

        $response = $this->getJson('/api/centers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'latitude', 'longitude']
                ]
            ])
            ->assertJsonCount(3, 'data');
    }
}
