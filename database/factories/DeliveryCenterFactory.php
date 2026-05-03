<?php

namespace Database\Factories;

use App\Models\DeliveryCenter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeliveryCenter>
 */
class DeliveryCenterFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = DeliveryCenter::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company() . ' Delivery Center',
            // Generate coordinates within a plausible urban area (e.g., Los Angeles area)
            'latitude' => $this->faker->latitude(33.7, 34.3),
            'longitude' => $this->faker->longitude(-118.6, -118.1),
        ];
    }
}
