<?php

namespace App\Enums;

enum OrderPriority: string
{
    case Priority = 'priority';
    case Normal = 'normal';

    public function rank(): int
    {
        return match ($this) {
            self::Priority => 2,
            self::Normal => 1,
        };
    }
}
