<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Http\Resources\VehicleResource;
use App\Repositories\Contracts\VehicleRepositoryInterface;
use App\Services\VehicleService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VehicleController extends Controller
{
    public function __construct(
        private readonly VehicleRepositoryInterface $vehicles,
        private readonly VehicleService $vehicleService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $centerId = $request->query('delivery_center_id');

        return VehicleResource::collection(
            $this->vehicles->all($centerId !== null ? (int) $centerId : null)
        );
    }

    public function store(StoreVehicleRequest $request): VehicleResource
    {
        $data = $request->validated();
        $center = \App\Models\DeliveryCenter::find($data['delivery_center_id']);
        
        if ($center) {
            $stateCode = $this->vehicleService->getStateCodeFromCenter($center);
            $data['vehicle_number'] = $this->vehicleService->generateIndianVehicleNumber($stateCode);
        } else {
            $data['vehicle_number'] = $this->vehicleService->generateIndianVehicleNumber();
        }

        $vehicle = $this->vehicles->create($data);
        $vehicle->load('deliveryCenter');

        return new VehicleResource($vehicle);
    }

    public function update(UpdateVehicleRequest $request, string $id): VehicleResource
    {
        $vehicle = $this->vehicles->find($id);

        abort_if(! $vehicle, 404);

        $vehicle = $this->vehicleService->updateVehicle($vehicle, $request->validated());
        $vehicle->load('deliveryCenter');

        return new VehicleResource($vehicle);
    }

    public function resetFleet(Request $request): \Illuminate\Http\JsonResponse
    {
        $centerId = $request->input('delivery_center_id');
        $query = \App\Models\Vehicle::query();
        if ($centerId) {
            $query->where('delivery_center_id', $centerId);
        }
        $query->update(['is_available' => true, 'current_load' => 0]);
        
        return response()->json(['message' => 'Fleet reset successful']);
    }
}
