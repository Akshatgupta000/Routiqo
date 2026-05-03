<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Repositories\Contracts\VehicleRepositoryInterface;
use Illuminate\Validation\ValidationException;

class VehicleService
{
    public function __construct(
        private readonly VehicleRepositoryInterface $vehicles,
    ) {}

    public function updateVehicle(Vehicle $vehicle, array $payload): Vehicle
    {
        if (isset($payload['capacity']) && (int) $payload['capacity'] < 1) {
            throw ValidationException::withMessages([
                'capacity' => __('Capacity must be at least 1.'),
            ]);
        }

        if (isset($payload['average_speed']) && (float) $payload['average_speed'] < 1) {
            throw ValidationException::withMessages([
                'average_speed' => __('Average speed must be at least 1 km/h.'),
            ]);
        }

        return $this->vehicles->update($vehicle, $payload);
    }
}
