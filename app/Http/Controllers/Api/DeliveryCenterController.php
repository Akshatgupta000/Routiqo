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
        $center = $this->centers->create($request->validated());

        return new DeliveryCenterResource($center);
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

        $this->centers->delete($center);

        return response()->json(['message' => 'Delivery center deleted successfully']);
    }
}
