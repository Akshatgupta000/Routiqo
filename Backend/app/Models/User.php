<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $connection = 'mongodb';

    protected $primaryKey = '_id';

    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'reset_password_otp',
        'reset_password_expires',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'reset_password_otp',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'reset_password_expires' => 'datetime',
        ];
    }

    /**
     * Override tokens relationship for MongoDB compatibility.
     */
    public function tokens()
    {
        return $this->morphMany(\App\Models\Sanctum\PersonalAccessToken::class, 'tokenable');
    }

    /**
     * Override createToken to bypass Sanctum's SQL-bound NewAccessToken class.
     */
    public function createToken(string $name, array $abilities = ['*'], \DateTimeInterface $expiresAt = null)
    {
        $plainTextToken = \Illuminate\Support\Str::random(40);

        $token = $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plainTextToken),
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
        ]);

        return new class($token, $token->getKey().'|'.$plainTextToken) {
            public $accessToken;
            public $plainTextToken;

            public function __construct($accessToken, $plainTextToken)
            {
                $this->accessToken = $accessToken;
                $this->plainTextToken = $plainTextToken;
            }

            public function toArray()
            {
                return [
                    'accessToken' => $this->accessToken,
                    'plainTextToken' => $this->plainTextToken,
                ];
            }
        };
    }
}
