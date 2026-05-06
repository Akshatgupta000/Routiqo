<?php

namespace App\Models\Sanctum;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;
use MongoDB\Laravel\Eloquent\DocumentModel;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    use DocumentModel;

    protected $connection = 'mongodb';
    protected $collection = 'personal_access_tokens';

    protected $primaryKey = '_id';
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'token',
        'abilities',
        'expires_at',
    ];

    /**
     * Find the token instance matching the given token.
     *
     * @param  string  $token
     * @return static|null
     */
    public static function findToken($token)
    {
        \Illuminate\Support\Facades\Log::debug('FIND_TOKEN_START: ' . substr($token, 0, 10));

        if (strpos($token, '|') === false) {
            $found = static::where('token', hash('sha256', $token))->first();
            return $found;
        }

        [$id, $token] = explode('|', $token, 2);

        // Use find($id) or where('_id', $id) for MongoDB compatibility
        $instance = static::find($id);

        if ($instance) {
            $matched = hash_equals($instance->token, hash('sha256', $token));
            \Illuminate\Support\Facades\Log::debug('FIND_TOKEN_RESULT: ' . ($matched ? 'MATCHED' : 'HASH_FAIL'));
            return $matched ? $instance : null;
        }

        return null;
    }
}
