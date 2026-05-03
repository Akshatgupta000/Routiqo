<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeliveryCenterRequest;
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
}
