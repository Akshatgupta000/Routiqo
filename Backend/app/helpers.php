<?php

use App\Helpers\DistanceHelper;

if (! function_exists('distance')) {
    /**
     * Haversine distance in kilometers between two coordinates.
     */
    function distance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        return DistanceHelper::kmBetween($lat1, $lon1, $lat2, $lon2);
    }
}

if (! function_exists('calculateDistance')) {
    function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        return DistanceHelper::kmBetween($lat1, $lon1, $lat2, $lon2);
    }
}
