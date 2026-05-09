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
                'User-Agent' => config('app.name', 'Routiqo') . ' (https://routiqo.onrender.com)',
            ])
            ->timeout(10)
            ->get('https://nominatim.openstreetmap.org/search', [
                'q' => $query,
                'format' => 'json',
                'limit' => 1,
            ]);

            if ($response->status() === 429 || $response->status() === 403) {
                Log::error('geocoding.blocked', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception('Geocoding service rate limited or blocked. Please try again later or use coordinates.');
            }

            if ($response->failed()) {
                throw new \Exception('Nominatim Geocoding service unavailable (Status: ' . $response->status() . ')');
            }

            $data = $response->json();

            if (!is_array($data) || empty($data)) {
                throw ValidationException::withMessages([
                    'address' => __('The provided address could not be located. Please try a more specific address or city name.'),
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
                'error' => $e->getMessage(),
                'type' => get_class($e)
            ]);

            if ($e instanceof ValidationException) {
                throw $e;
            }

            throw ValidationException::withMessages([
                'address' => __('Geocoding failed: ' . $e->getMessage()),
            ]);
        }
    }
}
