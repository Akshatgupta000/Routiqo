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
        $vehicle = $this->vehicles->create($request->validated());
        $vehicle->load('deliveryCenter');

        return new VehicleResource($vehicle);
    }

    public function update(UpdateVehicleRequest $request, int $id): VehicleResource
    {
        $vehicle = $this->vehicles->find($id);

        abort_if(! $vehicle, 404);

        $vehicle = $this->vehicleService->updateVehicle($vehicle, $request->validated());
        $vehicle->load('deliveryCenter');

        return new VehicleResource($vehicle);
    }
}
