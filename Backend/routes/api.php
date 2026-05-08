<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeliveryCenterController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

// Healthcheck
Route::get('/up', function () {
    return response()->json(['status' => 'ok']);
});

// Public Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});


// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::post('/centers', [DeliveryCenterController::class, 'store']);
    Route::get('/centers', [DeliveryCenterController::class, 'index']);
    Route::patch('/centers/{id}', [DeliveryCenterController::class, 'update']);
    Route::delete('/centers/{id}', [DeliveryCenterController::class, 'destroy']);

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/date-counts', [OrderController::class, 'dateCounts']);
    Route::get('/orders/bulk-counts', [OrderController::class, 'bulkCounts']);
    Route::delete('/orders/clear-by-date', [OrderController::class, 'clearByDate']);
    Route::delete('/orders/completed', [OrderController::class, 'deleteCompleted']);
    Route::delete('/orders/pending', [OrderController::class, 'deletePending']);
    Route::delete('/orders', [OrderController::class, 'deleteAll']);
    Route::post('/orders/mark-all-delivered', [OrderController::class, 'markAllDelivered']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::patch('/orders/{id}', [OrderController::class, 'update']);
    Route::post('/orders/{id}/assign', [OrderController::class, 'assign']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::patch('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::post('/vehicles/reset-fleet', [VehicleController::class, 'resetFleet']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

    Route::post('/routes/generate', [RouteController::class, 'generate']);
    Route::post('/routes/regenerate/{center_id}', [RouteController::class, 'regenerate']);

    Route::get('/zones', [\App\Http\Controllers\Api\ServiceZoneController::class, 'index']);
    Route::post('/zones/generate', [\App\Http\Controllers\Api\ServiceZoneController::class, 'store']);
    Route::get('/zones/check', [\App\Http\Controllers\Api\ServiceZoneController::class, 'check']);
    Route::delete('/routes/clear', [RouteController::class, 'clear']);
    Route::get('/routes', [RouteController::class, 'index']);
    Route::get('/routes/{id}', [RouteController::class, 'show']);
});

