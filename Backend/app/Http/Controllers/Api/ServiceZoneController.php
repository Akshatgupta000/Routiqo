<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceZone;
use Illuminate\Http\Request;

class ServiceZoneController extends Controller
{
    public function index()
    {
        return response()->json(ServiceZone::with('deliveryCenter')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'zones' => 'present|array',
            'zones.*.hub_id' => 'required',
            'zones.*.polygon' => 'required|array',
        ]);

        // Clear old zones and save new ones (deterministic replacement)
        ServiceZone::truncate();

        foreach ($request->zones as $zoneData) {
            ServiceZone::create([
                'delivery_center_id' => $zoneData['hub_id'],
                'polygon_coordinates' => $zoneData['polygon'],
            ]);
        }

        return response()->json(['message' => 'Service zones updated successfully']);
    }

    public function check(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $service = app(\App\Services\ServiceZoneService::class);
        $zones = ServiceZone::all();

        foreach ($zones as $zone) {
            if ($service->isPointInPolygon((float)$request->lat, (float)$request->lng, $zone->polygon_coordinates)) {
                return response()->json([
                    'hub_id' => $zone->delivery_center_id,
                    'zone' => $zone
                ]);
            }
        }

        return response()->json(['message' => 'No hub found for these coordinates'], 404);
    }
}
