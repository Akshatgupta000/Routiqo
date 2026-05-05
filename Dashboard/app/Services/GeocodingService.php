<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class GeocodingService
{
    /**
     * Geocode an address query into latitude and longitude.
     * Uses OpenStreetMap Nominatim API.
     * 
     * @param string $query
     * @return array{lat: float, lng: float}
     * @throws ValidationException
     */
    public function geocode(string $query): array
    {
        Log::debug('geocoding.request', ['query' => $query, 'service' => 'nominatim']);

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'LogiRoute-AI-Laravel-Backend',
            ])->get('https://nominatim.openstreetmap.org/search', [
                'q' => $query,
                'format' => 'json',
                'limit' => 1,
            ]);

            if ($response->failed()) {
                throw new \Exception('Nominatim Geocoding service unavailable');
            }

            $data = $response->json();

            if (empty($data)) {
                throw ValidationException::withMessages([
                    'address' => __('The provided address could not be located.'),
                ]);
            }

            $result = $data[0];

            return [
                'lat' => (float) $result['lat'],
                'lng' => (float) $result['lon'],
                'display_name' => $result['display_name'],
            ];
        } catch (\Exception $e) {
            Log::error('geocoding.error', [
                'query' => $query,
                'error' => $e->getMessage()
            ]);

            if ($e instanceof ValidationException) {
                throw $e;
            }

            throw ValidationException::withMessages([
                'address' => __('Geocoding failed. Please enter coordinates manually.'),
            ]);
        }
    }
}
