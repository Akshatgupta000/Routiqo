<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\DeliveryCenter;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "HUBS (with user_id info):\n";
$centers = DeliveryCenter::all();
foreach ($centers as $center) {
    echo "Hub Name: " . $center->name . "\n";
    echo "User ID: " . $center->user_id . " (Type: " . gettype($center->user_id) . ")\n";
    echo "-----------------------------\n";
}
