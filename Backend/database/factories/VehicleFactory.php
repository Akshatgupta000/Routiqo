<?php

namespace Database\Factories;

use App\Models\Vehicle;
use App\Models\DeliveryCenter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Vehicle::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Van ' . $this->faker->unique()->bothify('??-####'),
            'capacity' => $this->faker->numberBetween(5, 20),
            'average_speed' => $this->faker->randomFloat(1, 30, 60), // km/h
            'is_available' => true,
            'delivery_center_id' => DeliveryCenter::factory(),
        ];
    }
}
