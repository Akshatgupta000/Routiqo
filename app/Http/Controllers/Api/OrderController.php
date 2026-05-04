<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderService $orderService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $status = null;
        if ($request->filled('status')) {
            $status = OrderStatus::tryFrom((string) $request->query('status'));
            if (! $status instanceof OrderStatus) {
                throw ValidationException::withMessages([
                    'status' => __('Invalid status filter.'),
                ]);
            }
        }

        return OrderResource::collection(
            $this->orders->paginateWithFilters($perPage, $status)
        );
    }

    public function store(StoreOrderRequest $request): OrderResource
    {
        $order = $this->orderService->createOrder($request->validated());
        $order->load(['deliveryCenter', 'vehicle']);

        return new OrderResource($order);
    }

    public function update(UpdateOrderRequest $request, mixed $id): OrderResource
    {
        $order = $this->orders->find($id);

        abort_if(! $order, 404);

        $order = $this->orderService->updateOrderStatus($order, $request->validated('status'));
        $order->load(['deliveryCenter', 'vehicle']);

        return new OrderResource($order);
    }

    public function assign(mixed $id): OrderResource
    {
        $order = $this->orders->find($id);
        abort_if(!$order, 404);

        $order = $this->orderService->assignOrder($order);
        $order->load(['deliveryCenter', 'vehicle']);

        return new OrderResource($order);
    }

    public function destroy(mixed $id): \Illuminate\Http\JsonResponse
    {
        $order = $this->orders->find($id);

        if ($order) {
            $this->orders->delete($order);
        }

        return response()->json(null, 204);
    }
}
