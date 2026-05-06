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
        $hubId = $request->query('delivery_center_id');

        return OrderResource::collection(
            $this->orders->paginateWithFilters($perPage, $status, $date, $hubId)
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

        $start = \Carbon\Carbon::create($year, $month, 1)->startOfDay();
        $end = $start->copy()->endOfMonth()->endOfDay();

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

    /**
     * Get bulk counts for cleanup.
     * GET /api/orders/bulk-counts
     */
    public function bulkCounts(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = \App\Models\Order::query();
        if ($date = $request->query('date')) {
            $start = \Carbon\Carbon::parse($date)->startOfDay();
            $end = \Carbon\Carbon::parse($date)->endOfDay();
            $query->whereBetween('delivery_date', [$start, $end]);
        }

        return response()->json([
            'completed' => (clone $query)->whereIn('status', [OrderStatus::Delivered->value])->count(),
            'pending' => (clone $query)->where('status', OrderStatus::Pending->value)->count(),
            'total' => (clone $query)->count(),
        ]);
    }

    /**
     * Delete all orders for a given date.
     * DELETE /api/orders/clear-by-date?date=2026-05-05
     */
    public function clearByDate(Request $request): \Illuminate\Http\JsonResponse
    {
        $dateStr = $request->query('date');
        if (!$dateStr) {
            return response()->json(['message' => 'Date parameter is required.'], 422);
        }

        $start = \Carbon\Carbon::parse($dateStr)->startOfDay();
        $end = \Carbon\Carbon::parse($dateStr)->endOfDay();

        $count = \App\Models\Order::whereBetween('delivery_date', [$start, $end])->count();
        \App\Models\Order::whereBetween('delivery_date', [$start, $end])->delete();

        return response()->json(['deleted' => $count]);
    }

    /**
     * Delete all completed (delivered) orders.
     * DELETE /api/orders/completed
     */
    public function deleteCompleted(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = \App\Models\Order::whereIn('status', [OrderStatus::Delivered->value]);
        if ($date = $request->query('date')) {
            $start = \Carbon\Carbon::parse($date)->startOfDay();
            $end = \Carbon\Carbon::parse($date)->endOfDay();
            $query->whereBetween('delivery_date', [$start, $end]);
        }
        
        $count = $query->count();
        $query->delete();

        return response()->json([
            'success' => true,
            'deleted_count' => $count
        ]);
    }

    /**
     * Delete all pending orders.
     * DELETE /api/orders/pending
     */
    public function deletePending(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = \App\Models\Order::where('status', OrderStatus::Pending->value);
        if ($date = $request->query('date')) {
            $start = \Carbon\Carbon::parse($date)->startOfDay();
            $end = \Carbon\Carbon::parse($date)->endOfDay();
            $query->whereBetween('delivery_date', [$start, $end]);
        }
        
        $count = $query->count();
        $query->delete();

        return response()->json([
            'success' => true,
            'deleted_count' => $count
        ]);
    }

    /**
     * Delete all orders.
     * DELETE /api/orders
     */
    public function deleteAll(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = \App\Models\Order::query();
        if ($date = $request->query('date')) {
            $start = \Carbon\Carbon::parse($date)->startOfDay();
            $end = \Carbon\Carbon::parse($date)->endOfDay();
            $query->whereBetween('delivery_date', [$start, $end]);
        }

        $count = $query->count();
        if ($request->query('date')) {
            $query->delete();
        } else {
            \App\Models\Order::truncate();
        }

        return response()->json([
            'success' => true,
            'deleted_count' => $count
        ]);
    }

    /**
     * Mark all active orders as delivered.
     * POST /api/orders/mark-all-delivered
     */
    public function markAllDelivered(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = \App\Models\Order::whereIn('status', [
            OrderStatus::Pending->value,
            OrderStatus::Assigned->value,
        ]);
        
        if ($date = $request->query('date') ?? $request->input('date')) {
            $start = \Carbon\Carbon::parse($date)->startOfDay();
            $end = \Carbon\Carbon::parse($date)->endOfDay();
            $query->whereBetween('delivery_date', [$start, $end]);
        }
        
        $count = $query->count();
        $query->update(['status' => OrderStatus::Delivered->value]);

        return response()->json([
            'success' => true,
            'updated_count' => $count
        ]);
    }
}
