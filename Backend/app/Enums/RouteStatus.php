<?php

namespace App\Enums;

enum RouteStatus: string
{
    case Planned = 'planned';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}
