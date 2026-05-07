<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://routiqo-u3vk.vercel.app',
        'https://routiqo-nu.vercel.app',
        'https://routiqo-production.up.railway.app',
        env('CORS_ALLOWED_ORIGINS', '*'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
