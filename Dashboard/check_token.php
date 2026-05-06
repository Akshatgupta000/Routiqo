<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\Sanctum\PersonalAccessToken;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "LATEST TOKEN:\n";
$token = PersonalAccessToken::latest()->first();
if ($token) {
    print_r($token->toArray());
} else {
    echo "No tokens found.\n";
}
