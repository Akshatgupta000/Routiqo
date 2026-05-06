<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\DeliveryRoute;
use Database\Seeders\RoutePlanningSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouteOptimizationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoutePlanningSeeder::class);
    }

    public function test_generate_routes_returns_comparison_pairs(): void
    {
        $centerId = (string) \App\Models\DeliveryCenter::first()->id;
        $response = $this->postJson('/api/routes/generate', [
            'delivery_center_id' => $centerId,
            'date' => now()->format('Y-m-d'),
            'departure_at' => '2026-05-02T08:00:00-04:00',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'comparisons' => [
                    '*' => [
                        'comparison_batch_id',
                        'delivery_center_id',
                        'vehicle_id',
                        'shortest_distance_route' => [
                            'route_id',
                            'delivery_center' => [
                                'id',
                                'name',
                                'latitude',
                                'longitude',
                            ],
                            'vehicle' => [
                                'id',
                                'name',
                            ],
                            'total_distance',
                            'total_time',
                            'stops' => [
                                '*' => [
                                    'sequence',
                                    'order_id',
                                    'latitude',
                                    'longitude',
                                    'eta',
                                    'distance_from_previous',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

        $batch = $response->json('comparisons.0.comparison_batch_id');
        $this->assertNotEmpty($batch);

        $routes = DeliveryRoute::query()->where('comparison_batch_id', $batch)->get();
        $this->assertCount(1, $routes);

        $distanceRoute = DeliveryRoute::query()->where('comparison_batch_id', $batch)->where('optimization_profile', 'shortest_distance')->first();
        $this->assertNotNull($distanceRoute);

        foreach ($routes as $route) {
            $ids = $route->routeStops->pluck('order_id');
            $this->assertSame($ids->count(), $ids->unique()->count(), 'Stops within a route must be unique.');
        }
    }

    public function test_regenerate_center_rebuilds_planned_routes(): void
    {
        $centerId = (string) \App\Models\DeliveryCenter::first()->id;
        $date = now()->format('Y-m-d');

        $this->postJson('/api/routes/generate', [
            'delivery_center_id' => $centerId,
            'date' => $date,
        ])->assertCreated();

        $regen = $this->postJson("/api/routes/regenerate/{$centerId}", [
            'date' => $date,
        ]);
        $regen->assertOk()->assertJsonStructure(['comparisons']);
    }

    public function test_haversine_helper(): void
    {
        $km = distance(40.6782, -73.9442, 40.7282, -73.7949);
        $this->assertGreaterThan(10.0, $km);
        $this->assertLessThan(20.0, $km);
    }

    public function test_generate_fails_when_no_pending_orders(): void
    {
        $centerId = (string) \App\Models\DeliveryCenter::first()->id;
        $date = now()->format('Y-m-d');

        $this->postJson('/api/routes/generate', [
            'delivery_center_id' => $centerId,
            'date' => $date,
        ])->assertCreated();

        $this->postJson('/api/routes/generate', [
            'delivery_center_id' => $centerId,
            'date' => $date,
        ])->assertStatus(422);
    }

    public function test_simulation_start_and_next_stop(): void
    {
        $centerId = (string) \App\Models\DeliveryCenter::first()->id;
        $date = now()->format('Y-m-d');

        $this->postJson('/api/routes/generate', [
            'delivery_center_id' => $centerId,
            'date' => $date,
        ])->assertCreated();

        $routeId = DeliveryRoute::query()->where('optimization_profile', 'shortest_distance')->value('id');
        $this->assertNotNull($routeId);

        $this->postJson("/api/routes/{$routeId}/start")->assertOk()
            ->assertJsonPath('status', 'in_progress')
            ->assertJsonPath('next_stop_sequence', 1);

        $firstStopOrderId = DeliveryRoute::query()->find($routeId)->routeStops()->orderBy('sequence')->value('order_id');

        $this->postJson("/api/routes/{$routeId}/next-stop")->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $firstStopOrderId,
            'status' => OrderStatus::Delivered->value,
        ]);
    }

    public function test_orders_index_supports_pagination_and_status_filter(): void
    {
        $this->getJson('/api/orders?per_page=5&status=pending')->assertOk()
            ->assertJsonStructure(['data', 'links', 'meta']);
    }
}
