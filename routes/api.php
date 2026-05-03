<?php

use App\Http\Controllers\Api\DeliveryCenterController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

Route::post('/centers', [DeliveryCenterController::class, 'store']);
Route::get('/centers', [DeliveryCenterController::class, 'index']);

Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders', [OrderController::class, 'index']);
Route::patch('/orders/{id}', [OrderController::class, 'update']);

Route::post('/vehicles', [VehicleController::class, 'store']);
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::patch('/vehicles/{id}', [VehicleController::class, 'update']);

Route::post('/routes/generate', [RouteController::class, 'generate']);
Route::post('/routes/regenerate/{center_id}', [RouteController::class, 'regenerate']);
Route::get('/routes', [RouteController::class, 'index']);
Route::get('/routes/{id}', [RouteController::class, 'show']);

Route::post('/routes/{id}/start', [RouteController::class, 'start']);
Route::post('/routes/{id}/next-stop', [RouteController::class, 'nextStop']);
Route::post('/routes/{id}/complete', [RouteController::class, 'complete']);
