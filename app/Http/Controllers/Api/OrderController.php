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

        $date = $request->query('date');

        return OrderResource::collection(
            $this->orders->paginateWithFilters($perPage, $status, $date)
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

        $order = $this->orders->update($order, $request->validated());
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

    /**
     * Return order counts grouped by delivery_date for a given month.
     * GET /api/orders/date-counts?year=2026&month=5
     */
    public function dateCounts(Request $request): \Illuminate\Http\JsonResponse
    {
        $year = (int) $request->query('year', now()->year);
        $month = (int) $request->query('month', now()->month);

        $start = sprintf('%04d-%02d-01', $year, $month);
        $end = sprintf('%04d-%02d-%02d', $year, $month, cal_days_in_month(CAL_GREGORIAN, $month, $year));

        $orders = \App\Models\Order::query()
            ->whereBetween('delivery_date', [$start, $end])
            ->get()
            ->groupBy(function ($order) {
                $date = $order->delivery_date;
                if ($date instanceof \Illuminate\Support\Carbon) {
                    return $date->format('Y-m-d');
                }
                return (string) $date;
            })
            ->map->count();

        return response()->json($orders);
    }
}
