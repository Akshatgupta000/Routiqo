<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Models\DeliveryCenter;

class VehicleService
{
    /**
     * Generate a valid Indian vehicle registration number
     * Format: [STATE CODE][RTO CODE] [SERIES] [NUMBER]
     * Example: DL01AB1234
     */
    public function generateIndianVehicleNumber(string $stateCode = 'DL'): string
    {
        $rtoCode = str_pad(rand(1, 99), 2, '0', STR_PAD_LEFT);
        $series = chr(rand(65, 90)) . chr(rand(65, 90));
        $number = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

        return $stateCode . $rtoCode . $series . $number;
    }

    /**
     * Helper to map a location or center name to an Indian State Code
     */
    public function getStateCodeFromCenter(DeliveryCenter $center): string
    {
        $name = strtolower($center->name);
        
        if (str_contains($name, 'delhi')) return 'DL';
        if (str_contains($name, 'maharashtra') || str_contains($name, 'mumbai') || str_contains($name, 'pune')) return 'MH';
        if (str_contains($name, 'bengal') || str_contains($name, 'kolkata')) return 'WB';
        if (str_contains($name, 'karnataka') || str_contains($name, 'bangalore')) return 'KA';
        if (str_contains($name, 'tamil') || str_contains($name, 'chennai')) return 'TN';
        if (str_contains($name, 'uttar') || str_contains($name, 'lucknow') || str_contains($name, 'noida')) return 'UP';
        
        return 'DL'; // Default
    }

    /**
     * Create a new vehicle for a center with an auto-generated number
     */
    public function createVehicleForCenter(DeliveryCenter $center, array $data = []): Vehicle
    {
        $stateCode = $this->getStateCodeFromCenter($center);
        
        return Vehicle::create([
            'name' => $data['name'] ?? 'Delivery Van',
            'vehicle_number' => $this->generateIndianVehicleNumber($stateCode),
            'capacity' => $data['capacity'] ?? 100,
            'is_available' => true,
            'current_load' => 0,
            'delivery_center_id' => $center->id,
        ]);
    }
}
