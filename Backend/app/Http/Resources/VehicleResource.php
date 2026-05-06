<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Vehicle */
class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'vehicle_number' => $this->vehicle_number ?? null,
            'capacity' => $this->capacity,
            'current_load' => $this->current_load ?? 0,
            'is_available' => (bool) $this->is_available,
            'average_speed' => (float) $this->average_speed,
            'delivery_center_id' => $this->delivery_center_id,
            'delivery_center' => DeliveryCenterResource::make($this->whenLoaded('deliveryCenter')),
        ];
    }
}
