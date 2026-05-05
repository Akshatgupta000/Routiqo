<?php

namespace App\Providers;

use App\Repositories\Contracts\DeliveryCenterRepositoryInterface;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\RouteRepositoryInterface;
use App\Repositories\Contracts\VehicleRepositoryInterface;
use App\Repositories\EloquentDeliveryCenterRepository;
use App\Repositories\EloquentOrderRepository;
use App\Repositories\EloquentRouteRepository;
use App\Repositories\EloquentVehicleRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(DeliveryCenterRepositoryInterface::class, EloquentDeliveryCenterRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, EloquentOrderRepository::class);
        $this->app->bind(VehicleRepositoryInterface::class, EloquentVehicleRepository::class);
        $this->app->bind(RouteRepositoryInterface::class, EloquentRouteRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
