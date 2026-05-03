<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'capacity' => ['required', 'integer', 'min:1', 'max:1000'],
            'average_speed' => ['sometimes', 'numeric', 'min:1', 'max:200'],
            'is_available' => ['sometimes', 'boolean'],
            'delivery_center_id' => ['required', 'integer', Rule::exists('delivery_centers', 'id')],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('average_speed')) {
            $this->merge(['average_speed' => 25]);
        }

        if (! $this->has('is_available')) {
            $this->merge(['is_available' => true]);
        }
    }
}
