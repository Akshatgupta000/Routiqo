<?php

namespace Database\Factories;

use App\Enums\OrderPriority;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\DeliveryCenter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'address' => $this->faker->streetAddress(),
            'latitude' => $this->faker->latitude(33.7, 34.3),
            'longitude' => $this->faker->longitude(-118.6, -118.1),
            'delivery_center_id' => DeliveryCenter::factory(),
            'status' => OrderStatus::Pending,
            'priority' => $this->faker->randomElement([
                OrderPriority::Normal,
                OrderPriority::Priority,
            ]),
        ];
    }
}
