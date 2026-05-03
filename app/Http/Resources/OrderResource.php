<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Order */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'address' => $this->address,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'delivery_center_id' => $this->delivery_center_id,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'priority' => $this->priority instanceof \BackedEnum ? $this->priority->value : $this->priority,
            'delivery_center' => DeliveryCenterResource::make($this->whenLoaded('deliveryCenter')),
        ];
    }
}
