<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\UserDetail;

class StorePropertyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        /** @var UserDetail $user */
        $user = Auth::user();
        
        // Check if user is not an admin
        if ($user->roles()->where('role_name', 'admin')->exists()) {
            return false;
        }

        // Check if user has landlord role
        return $user->roles()->where('role_name', 'landlord')->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'property_name' => 'required|string|max:255',
            'address' => 'required|string',
            'location' => 'required|string',
            'description' => 'required|string',
            'utilities' => 'required|array',
            'utilities.*.utility_name' => 'required|string|max:255',
            'utilities.*.description' => 'required|string',
            'utilities.*.price' => 'required|numeric|min:0',
            'rooms' => 'required|array',
            'rooms.*.floor_number' => 'required|integer|min:1',
            'rooms.*.room_number' => 'required|integer|min:1',
            'rooms.*.description' => 'nullable|string',
            'rooms.*.room_type' => 'required|string|max:255',
            'rooms.*.rent_amount' => 'required|numeric|min:0',
            'rooms.*.utility_readings' => 'required|array',
            'rooms.*.utility_readings.*.utility_name' => 'required|string|max:255',
            'rooms.*.utility_readings.*.reading' => 'required|numeric|min:0',
            'rooms.*.due_date' => 'required|date',
            'rooms.*.available' => 'required|boolean'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'property_name.required' => 'Property name is required.',
            'property_name.max' => 'Property name cannot exceed 255 characters.',
            'address.required' => 'Property address is required.',
            'location.required' => 'Property location is required.',
            'description.required' => 'Property description is required.',
            'utilities.required' => 'At least one utility is required.',
            'utilities.*.utility_name.required' => 'Utility name is required.',
            'utilities.*.price.required' => 'Utility price is required.',
            'utilities.*.price.min' => 'Utility price must be greater than or equal to 0.',
            'rooms.required' => 'At least one room is required.',
            'rooms.*.floor_number.required' => 'Floor number is required for each room.',
            'rooms.*.floor_number.min' => 'Floor number must be greater than 0.',
            'rooms.*.room_number.required' => 'Room number is required.',
            'rooms.*.room_type.required' => 'Room type is required.',
            'rooms.*.rent_amount.required' => 'Rent amount is required.',
            'rooms.*.rent_amount.min' => 'Rent amount must be greater than or equal to 0.',
            'rooms.*.due_date.required' => 'Due date is required for each room.',
            'rooms.*.due_date.date' => 'Due date must be a valid date.',
            'rooms.*.available.required' => 'Room availability status is required.'
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Add the authenticated user's ID as the landlord_id
        $this->merge([
            'landlord_id' => Auth::id()
        ]);
    }
} 