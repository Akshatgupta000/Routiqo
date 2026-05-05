<?php

namespace App\Http\Requests;

use App\Enums\OrderPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address' => ['required', 'string', 'max:500'],
            'delivery_date' => ['required', 'date'],
            'priority' => ['sometimes', new Enum(OrderPriority::class)],
        ];
    }
}
