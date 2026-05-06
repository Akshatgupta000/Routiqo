<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Models\DeliveryCenter;

class VehicleService
{
    /**
     * Generate a valid Indian vehicle registration number
     * Format: [PREFIX] [SERIES] [NUMBER]
     * Example: UP32AB1234
     */
    public function generateIndianVehicleNumber(string $prefix = 'DL01'): string
    {
        $series = chr(rand(65, 90)) . chr(rand(65, 90));
        $number = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

        return $prefix . $series . $number;
    }

    /**
     * Helper to map a center name to an Indian RTO Prefix (State + District Code)
     */
    public function getRTOPrefixFromCenter(DeliveryCenter $center): string
    {
        $name = strtolower($center->name);
        
        // Uttar Pradesh
        if (str_contains($name, 'lucknow') || str_contains($name, 'charbagh') || str_contains($name, 'indira nagar')) return 'UP32';
        if (str_contains($name, 'noida')) return 'UP16';
        if (str_contains($name, 'ghaziabad')) return 'UP14';
        if (str_contains($name, 'kanpur')) return 'UP78';
        
        // Delhi
        if (str_contains($name, 'delhi')) return 'DL01';
        
        // Maharashtra
        if (str_contains($name, 'mumbai') || str_contains($name, 'andheri')) return 'MH01';
        if (str_contains($name, 'pune')) return 'MH12';
        
        // Karnataka
        if (str_contains($name, 'bangalore') || str_contains($name, 'bengaluru') || str_contains($name, 'koramangala')) return 'KA01';
        
        // West Bengal
        if (str_contains($name, 'kolkata') || str_contains($name, 'howrah')) return 'WB01';
        
        // Tamil Nadu
        if (str_contains($name, 'chennai')) return 'TN01';
        
        // Haryana
        if (str_contains($name, 'gurgaon') || str_contains($name, 'gurugram')) return 'HR26';
        
        // Default to a generic code if no match
        return 'DL01';
    }

    /**
     * Create a new vehicle for a center with an auto-generated number
     */
    public function createVehicleForCenter(DeliveryCenter $center, array $data = []): Vehicle
    {
        $prefix = $this->getRTOPrefixFromCenter($center);
        
        return Vehicle::create([
            'name' => $data['name'] ?? 'Delivery Van',
            'vehicle_number' => $this->generateIndianVehicleNumber($prefix),
            'capacity' => $data['capacity'] ?? 100,
            'is_available' => true,
            'current_load' => 0,
            'delivery_center_id' => $center->id,
        ]);
    }
    /**
     * Update an existing vehicle's fields.
     */
    public function updateVehicle(Vehicle $vehicle, array $data): Vehicle
    {
        $vehicle->update($data);
        return $vehicle->fresh();
    }
}
