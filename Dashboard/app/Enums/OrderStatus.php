<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Assigned = 'assigned';
    case Delivered = 'delivered';
}
