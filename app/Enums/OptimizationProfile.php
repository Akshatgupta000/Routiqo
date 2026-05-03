<?php

namespace App\Enums;

enum OptimizationProfile: string
{
    case ShortestDistance = 'shortest_distance';
    case FastestTime = 'fastest_time';
}
