<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeliveryCenterRequest;
use App\Http\Requests\UpdateDeliveryCenterRequest;
use App\Http\Resources\DeliveryCenterResource;
use App\Repositories\Contracts\DeliveryCenterRepositoryInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DeliveryCenterController extends Controller
{
    public function __construct(
        private readonly DeliveryCenterRepositoryInterface $centers,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return DeliveryCenterResource::collection($this->centers->all());
    }

    public function store(StoreDeliveryCenterRequest $request): DeliveryCenterResource
    {
        try {
            $center = $this->centers->create($request->validated());
            
            // Step 2: Auto-redistribute orders (New hub captures nearby orders)
            // We fetch all orders that might need to be "captured" by this new hub
            $this->reassignOrdersToBestCenter(\App\Models\Order::all());
            
            return new DeliveryCenterResource($center);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Hub Creation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function update(UpdateDeliveryCenterRequest $request, mixed $id): DeliveryCenterResource
    {
        $center = $this->centers->find($id);
        abort_if(! $center, 404);

        $center = $this->centers->update($center, $request->validated());

        return new DeliveryCenterResource($center);
    }

    public function destroy(mixed $id): \Illuminate\Http\JsonResponse
    {
        $center = $this->centers->find($id);
        abort_if(! $center, 404);

        try {
            // Step 1: Get orders of deleting hub before deletion
            // Using a string ID for MongoDB query safety
            $orders = \App\Models\Order::where('delivery_center_id', (string)$id)->get();
            
            // Step 2: DELETE VEHICLES (Mandatory cleanup)
            \App\Models\Vehicle::where('delivery_center_id', (string)$id)->delete();
            
            // Step 3: Clean up associated service zone
            \App\Models\ServiceZone::where('delivery_center_id', (string)$id)->delete();
            
            // Step 4: Delete Hub
            $this->centers->delete($center);
            
            // Step 5: Reassign Orders to remaining hubs
            // Pass the orphaned orders to the engine
            $this->reassignOrdersToBestCenter($orders);
            
            // Step 6: Clear ALL routes to reset map as requested
            \App\Models\DeliveryRoute::query()->delete();

            return response()->json([
                'message' => 'Hub deleted and orders reassigned',
                'centers' => DeliveryCenterResource::collection($this->centers->all())
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Hub Deletion Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete hub: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reusable Order Reassignment Engine
     */
    private function reassignOrdersToBestCenter($orders): void
    {
        $centers = \App\Models\DeliveryCenter::all();
        if ($centers->isEmpty()) {
            foreach ($orders as $order) {
                $order->update(['delivery_center_id' => null, 'status' => \App\Enums\OrderStatus::Pending]);
            }
            return;
        }

        foreach ($orders as $order) {
            $nearestCenter = null;
            $minDist = 10.0; // Strict 10km radius

            // Optimization: Bounding Box Filter (Approx 0.1 deg ~ 11.1km)
            // This avoids Haversine for centers that are clearly too far away
            $orderLat = (float)$order->latitude;
            $orderLon = (float)$order->longitude;

            foreach ($centers as $center) {
                $cLat = (float)$center->latitude;
                $cLon = (float)$center->longitude;

                // Simple rectangular check first
                if (abs($orderLat - $cLat) > 0.12 || abs($orderLon - $cLon) > 0.12) {
                    continue;
                }

                $dist = \App\Helpers\DistanceHelper::kmBetween($orderLat, $orderLon, $cLat, $cLon);

                if ($dist <= $minDist) {
                    $minDist = $dist;
                    $nearestCenter = $center;
                }
            }

            if ($nearestCenter) {
                $order->update([
                    'delivery_center_id' => $nearestCenter->id,
                    'status' => \App\Enums\OrderStatus::Assigned
                ]);
            } else {
                $order->update([
                    'delivery_center_id' => null,
                    'status' => \App\Enums\OrderStatus::Pending
                ]);
            }
        }
    }
}
