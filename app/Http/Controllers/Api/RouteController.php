<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateRouteRequest;
use App\Http\Resources\RouteOptimizationResource;
use App\Models\DeliveryRoute;
use App\Repositories\Contracts\RouteRepositoryInterface;
use App\Services\RouteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
class RouteController extends Controller
{
    public function __construct(
        private readonly RouteRepositoryInterface $routes,
        private readonly RouteService $routeService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $routes = $this->routes->all();

        $payload = $routes->map(function (DeliveryRoute $route) use ($request) {
            return (new RouteOptimizationResource($route))->toArray($request);
        })->all();

        return response()->json(['routes' => $payload]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $route = $this->routeService->findRouteForRead($id);

        abort_if(! $route, 404);

        return response()->json(
            (new RouteOptimizationResource($route))->toArray($request)
        );
    }

    public function generate(GenerateRouteRequest $request): JsonResponse
    {
        $departure = $request->filled('departure_at')
            ? Carbon::parse($request->input('departure_at'))
            : null;

        $centerId = $request->validated('delivery_center_id');

        $comparisons = $this->routeService->generateRoutes(
            $centerId !== null ? (int) $centerId : null,
            $departure
        );

        $payload = array_map(function (array $row) use ($request) {
            return [
                'comparison_batch_id' => $row['comparison_batch_id'],
                'delivery_center_id' => $row['delivery_center_id'],
                'vehicle_id' => $row['vehicle_id'],
                'shortest_distance_route' => (new RouteOptimizationResource($row['shortest_distance_route']))->toArray($request),
                'fastest_time_route' => (new RouteOptimizationResource($row['fastest_time_route']))->toArray($request),
            ];
        }, $comparisons);

        return response()->json(['comparisons' => $payload], 201);
    }

    public function regenerate(Request $request, int $center_id): JsonResponse
    {
        $comparisons = $this->routeService->regenerateRoutesForCenter($center_id);

        $payload = array_map(function (array $row) use ($request) {
            return [
                'comparison_batch_id' => $row['comparison_batch_id'],
                'delivery_center_id' => $row['delivery_center_id'],
                'vehicle_id' => $row['vehicle_id'],
                'shortest_distance_route' => (new RouteOptimizationResource($row['shortest_distance_route']))->toArray($request),
                'fastest_time_route' => (new RouteOptimizationResource($row['fastest_time_route']))->toArray($request),
            ];
        }, $comparisons);

        return response()->json(['comparisons' => $payload]);
    }

    public function start(Request $request, int $id): JsonResponse
    {
        $route = $this->routeService->startRoute($id);

        return response()->json(
            (new RouteOptimizationResource($route))->toArray($request)
        );
    }

    public function nextStop(Request $request, int $id): JsonResponse
    {
        $route = $this->routeService->advanceNextStop($id);

        return response()->json(
            (new RouteOptimizationResource($route))->toArray($request)
        );
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $route = $this->routeService->completeRoute($id);

        return response()->json(
            (new RouteOptimizationResource($route))->toArray($request)
        );
    }
}
