<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateRouteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delivery_center_id' => ['nullable', 'string'],
            'departure_at' => ['nullable', 'date'],
            'date' => ['required', 'date'],
        ];
    }
}
