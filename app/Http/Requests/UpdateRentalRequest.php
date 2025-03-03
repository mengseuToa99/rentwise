<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRentalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true; // Assuming authorization is handled elsewhere
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'landlord_id' => 'sometimes|exists:user_detail,user_id',
            'tenant_id' => 'sometimes|exists:user_detail,user_id',
            'room_id' => 'sometimes|exists:room_detail,room_id',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'lease_agreement' => 'nullable|string'
        ];
    }
}