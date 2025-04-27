<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\PropertyDetail;
use App\Models\RoomDetail;

class StoreRentalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        
        // Check if user is not an admin
        if ($user->roles()->where('role_name', 'admin')->exists()) {
            return false;
        }

        // If landlord_id is provided in the request
        if ($this->has('landlord_id')) {
            // Check if the landlord_id matches the authenticated user's ID
            return $this->landlord_id == $user->user_id;
        }

        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'landlord_id' => 'required|exists:user_detail,user_id',
            'tenant_id' => 'required|exists:user_detail,user_id',
            'room_id' => [
                'required',
                'exists:room_detail,room_id',
                function ($attribute, $value, $fail) {
                    // Check if the room belongs to the landlord
                    $room = RoomDetail::find($value);
                    if (!$room) {
                        $fail('Room not found.');
                        return;
                    }

                    $property = PropertyDetail::find($room->property_id);
                    if (!$property || $property->landlord_id != $this->landlord_id) {
                        $fail('The room does not belong to this landlord.');
                    }
                },
            ],
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'lease_agreement' => 'nullable|string'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'landlord_id.required' => 'The landlord ID is required.',
            'landlord_id.exists' => 'The specified landlord does not exist.',
            'tenant_id.required' => 'The tenant ID is required.',
            'tenant_id.exists' => 'The specified tenant does not exist.',
            'room_id.required' => 'The room ID is required.',
            'room_id.exists' => 'The specified room does not exist.',
            'start_date.required' => 'The start date is required.',
            'start_date.date_format' => 'The start date must be in YYYY-MM-DD format.',
            'end_date.date_format' => 'The end date must be in YYYY-MM-DD format.',
            'end_date.after_or_equal' => 'The end date must be after or equal to the start date.'
        ];
    }
}