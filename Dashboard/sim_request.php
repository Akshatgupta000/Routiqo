<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\Sanctum\PersonalAccessToken;
use Illuminate\Http\Request;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$dbToken = PersonalAccessToken::latest()->first();
if (!$dbToken) die("No tokens.\n");

// We need the plain text token. Since we don't have it, we'll try to find an ID|text pattern.
// In our diagnostic earlier, we saw IDs like 69fb1cdb4de46d62a50d4c07.
// Let's assume a test token string format.
// Wait! I can't guess the plain text.
// But I can MANUALLY trigger the middleware logic.

$request = Request::create('/api/debug-auth', 'GET');
// Mocking the bearer token (this won't work for real auth check unless we have the plain text)
// BUT we can check if the Guard correctly calls findToken.

echo "Calling debug-auth via Kernel...\n";
$response = $kernel->handle($request);
echo "Response Status: " . $response->getStatusCode() . "\n";
echo "Response Body: " . $response->getContent() . "\n";
