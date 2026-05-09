<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
        $middleware->statefulApi();

        $middleware->redirectGuestsTo(function () {
            return null;
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }
        });

        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return response()->json([
                        'success' => false,
                        'message' => $e->getMessage(),
                        'errors' => $e->errors(),
                    ], 422);
                }

                $statusCode = method_exists($e, 'getStatusCode')
                    ? $e->getStatusCode()
                    : (property_exists($e, 'status') ? $e->status : 500);

                // If it's a 500 and we have a message, it might be better to show it in dev but hide in prod
                // For now, we'll keep it simple
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'An unexpected error occurred',
                ], $statusCode);
            }
        });
    })->create();
