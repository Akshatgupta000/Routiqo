<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'capacity' => ['sometimes', 'integer', 'min:1', 'max:1000'],
            'average_speed' => ['sometimes', 'numeric', 'min:1', 'max:200'],
            'is_available' => ['sometimes', 'boolean'],
        ];
    }
}
