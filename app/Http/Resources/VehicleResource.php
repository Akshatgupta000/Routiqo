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
            'capacity' => (int) $this->capacity,
            'average_speed' => (float) $this->average_speed,
            'is_available' => (bool) $this->is_available,
            'delivery_center_id' => $this->delivery_center_id,
            'delivery_center' => DeliveryCenterResource::make($this->whenLoaded('deliveryCenter')),
        ];
    }
}
