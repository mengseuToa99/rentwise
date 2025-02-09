<?php

namespace App\Http\Controllers;

use App\Models\PropertyDetail;
use App\Models\RoomDetail;
use App\Models\Utility;
use App\Models\UtilityPrice;
use App\Models\UtilityUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{

    /**
     * Update the specified room with detailed validation.
     *
     * @param Request $request
     * @param int $propertyId
     * @param int $roomId
     * @return \Illuminate\Http\JsonResponse
     */
    public function editRoom(Request $request, $propertyId, $roomId)
    {
        $property = PropertyDetail::find($propertyId);
        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $room = RoomDetail::where('property_id', $propertyId)
            ->where('room_id', $roomId)
            ->first();

        if (!$room) {
            return response()->json(['message' => 'Room not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'floor_number' => 'integer|min:1',
            'room_number' => 'integer|min:1',
            'description' => 'nullable|string',
            'room_type' => 'string|max:255',
            'rent_amount' => 'numeric|min:0',
            'due_date' => 'date',
            'available' => 'boolean',
            'electricity_reading' => 'numeric|min:0',
            'water_reading' => 'numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Update room details
            $room->update([
                'floor_number' => $request->floor_number ?? $room->floor_number,
                'room_number' => $request->room_number ?? $room->room_number,
                'room_name' => $request->has('floor_number') || $request->has('room_number') || $request->has('room_type')
                    ? sprintf(
                        'F%d-%s-%s',
                        $request->floor_number ?? $room->floor_number,
                        $request->room_type ?? $room->room_type,
                        $request->room_number ?? $room->room_number
                    )
                    : $room->room_name,
                'description' => $request->description ?? $room->description,
                'room_type' => $request->room_type ?? $room->room_type,
                'rent_amount' => $request->rent_amount ?? $room->rent_amount,
                'due_date' => $request->due_date ?? $room->due_date,
                'available' => $request->available ?? $room->available
            ]);

            // Update utility readings if provided
            if ($request->has('electricity_reading')) {
                UtilityUsage::create([
                    'room_id' => $room->room_id,
                    'utility_id' => 1, // Electricity
                    'usage_date' => now(),
                    'new_meter_reading' => $request->electricity_reading,
                    'old_meter_reading' => UtilityUsage::where('room_id', $room->room_id)
                        ->where('utility_id', 1)
                        ->latest('usage_date')
                        ->first()
                        ->new_meter_reading ?? 0,
                    'amount_used' => $request->electricity_reading - (
                        UtilityUsage::where('room_id', $room->room_id)
                        ->where('utility_id', 1)
                        ->latest('usage_date')
                        ->first()
                        ->new_meter_reading ?? 0
                    )
                ]);
            }

            if ($request->has('water_reading')) {
                UtilityUsage::create([
                    'room_id' => $room->room_id,
                    'utility_id' => 2, // Water
                    'usage_date' => now(),
                    'new_meter_reading' => $request->water_reading,
                    'old_meter_reading' => UtilityUsage::where('room_id', $room->room_id)
                        ->where('utility_id', 2)
                        ->latest('usage_date')
                        ->first()
                        ->new_meter_reading ?? 0,
                    'amount_used' => $request->water_reading - (
                        UtilityUsage::where('room_id', $room->room_id)
                        ->where('utility_id', 2)
                        ->latest('usage_date')
                        ->first()
                        ->new_meter_reading ?? 0
                    )
                ]);
            }

            DB::commit();
            return response()->json([
                'message' => 'Room updated successfully',
                'room' => $room->fresh()
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error updating room',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Update the specified property with detailed validation.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function editProperty(Request $request, $id)
    {
        $property = PropertyDetail::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'property_name' => 'string|max:255',
            'address' => 'string|max:255',
            'location' => 'string|max:255',
            'description' => 'string',
            'water_price' => 'numeric|min:0',
            'electricity_price' => 'numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Update property details
            $property->update([
                'property_name' => $request->property_name ?? $property->property_name,
                'address' => $request->address ?? $property->address,
                'location' => $request->location ?? $property->location,
                'description' => $request->description ?? $property->description
            ]);

            // Update utility prices if provided
            if ($request->has('electricity_price')) {
                UtilityPrice::create([
                    'utility_id' => 1, // Electricity
                    'price' => $request->electricity_price,
                    'effective_date' => now()
                ]);
            }

            if ($request->has('water_price')) {
                UtilityPrice::create([
                    'utility_id' => 2, // Water
                    'price' => $request->water_price,
                    'effective_date' => now()
                ]);
            }

            DB::commit();
            return response()->json([
                'message' => 'Property updated successfully',
                'property' => $property->fresh()->load('rooms')
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error updating property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created property.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'landlord_id' => 'required|exists:user_detail,user_id',
            'property_name' => 'required|string|max:255',
            'address' => 'required|string',
            'location' => 'required|string',
            'description' => 'required|string',
            'water_price' => 'required|numeric|min:0',
            'electricity_price' => 'required|numeric|min:0',
            'rooms' => 'required|array',
            'rooms.*.floor_number' => 'required|integer|min:1',
            'rooms.*.room_number' => 'required|integer|min:1',
            'rooms.*.description' => 'nullable|string',
            'rooms.*.room_type' => 'required|string|max:255',  // Changed to accept any string
            'rooms.*.rent_amount' => 'required|numeric|min:0',
            'rooms.*.electricity_reading' => 'required|numeric|min:0',
            'rooms.*.water_reading' => 'required|numeric|min:0',
            'rooms.*.due_date' => 'required|date',
            'rooms.*.available' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create utilities first and store their IDs
            $electricityUtility = Utility::firstOrCreate(
                ['utility_id' => 1],
                [
                    'utility_name' => 'Electricity',
                    'description' => 'Electricity usage'
                ]
            );

            $waterUtility = Utility::firstOrCreate(
                ['utility_id' => 2],
                [
                    'utility_name' => 'Water',
                    'description' => 'Water usage'
                ]
            );

            // Verify utilities were created successfully
            if (!$electricityUtility || !$waterUtility) {
                throw new \Exception('Failed to create utilities');
            }

            $property = PropertyDetail::create([
                'landlord_id' => $request->landlord_id,
                'property_name' => $request->property_name,
                'address' => $request->address,
                'location' => $request->location,
                'description' => $request->description,
                'total_floors' => max(array_column($request->rooms, 'floor_number')),
                'total_rooms' => count($request->rooms)
            ]);

            // Create utility prices
            UtilityPrice::create([
                'utility_id' => $electricityUtility->utility_id,
                'price' => $request->electricity_price,
                'effective_date' => now()
            ]);

            UtilityPrice::create([
                'utility_id' => $waterUtility->utility_id,
                'price' => $request->water_price,
                'effective_date' => now()
            ]);

            foreach ($request->rooms as $roomData) {
                $room = new RoomDetail([
                    'floor_number' => $roomData['floor_number'],
                    'room_number' => $roomData['room_number'],
                    'room_name' => sprintf(
                        'F%d-%s-%s',
                        $roomData['floor_number'],
                        $roomData['room_type'],
                        $roomData['room_number']
                    ),
                    'description' => $roomData['description'],
                    'room_type' => $roomData['room_type'],
                    'rent_amount' => $roomData['rent_amount'],
                    'due_date' => $roomData['due_date'],
                    'available' => $roomData['available']
                ]);

                $property->rooms()->save($room);

                UtilityUsage::create([
                    'room_id' => $room->room_id,
                    'utility_id' => $electricityUtility->utility_id,
                    'usage_date' => now(),
                    'new_meter_reading' => $roomData['electricity_reading'],
                    'old_meter_reading' => 0,
                    'amount_used' => 0
                ]);

                UtilityUsage::create([
                    'room_id' => $room->room_id,
                    'utility_id' => $waterUtility->utility_id,
                    'usage_date' => now(),
                    'new_meter_reading' => $roomData['water_reading'],
                    'old_meter_reading' => 0,
                    'amount_used' => 0
                ]);
            }

            DB::commit();
            return response()->json([
                'property' => $property->load('rooms'),
                'message' => 'Property with rooms created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error creating property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified property.
     */
    public function getPropertiesByLandlord($landlordId)
    {
        // Validate if the landlord exists
        $properties = PropertyDetail::where('landlord_id', $landlordId)
            ->with(['images', 'rooms' => function ($query) {
                $query->withCount(['rentals' => function ($q) {
                    $q->whereNull('end_date'); // Assuming active rentals are those without an end_date
                    // Or if you have a specific column for active status, use that instead
                    // $q->where('rental_status', 'active');
                }]);
            }])
            ->get();

        if ($properties->isEmpty()) {
            return response()->json([
                'message' => 'No properties found for this landlord'
            ], 404);
        }

        return response()->json([
            'properties' => $properties,
            'total_properties' => $properties->count(),
            'total_rooms' => $properties->sum(function ($property) {
                return $property->rooms->count();
            }),
            'total_occupied_rooms' => $properties->sum(function ($property) {
                return $property->rooms->sum('rentals_count');
            })
        ], 200);
    }

    /**
     * Update the specified property.
     */
    public function update(Request $request, $id)
    {
        $property = PropertyDetail::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'property_name' => 'string|max:255',
            'address' => 'string',
            'location' => 'string',
            'total_floors' => 'integer|min:1',
            'total_rooms' => 'integer|min:1',
            'description' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $property->update($request->all());
        return response()->json(['property' => $property, 'message' => 'Property updated successfully'], 200);
    }

    /**
     * Remove the specified property.
     */
    public function destroy($id)
    {
        $property = PropertyDetail::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $property->delete();
        return response()->json(['message' => 'Property deleted successfully'], 200);
    }

    /**
     * Get all rooms for a specific property.
     */
    public function getRooms($propertyId)
    {
        $property = PropertyDetail::find($propertyId);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $rooms = $property->rooms()->with('rentals')->get();
        return response()->json(['rooms' => $rooms], 200);
    }

    /**
     * Get available rooms for a specific property.
     */
    public function getAvailableRooms($propertyId)
    {
        $property = PropertyDetail::find($propertyId);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $availableRooms = $property->rooms()
            ->where('available', true)
            ->get();

        return response()->json(['available_rooms' => $availableRooms], 200);
    }

    /**
     * Search properties by location or name.
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'search' => 'required|string|min:2'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $searchTerm = $request->search;
        $properties = PropertyDetail::where('property_name', 'LIKE', "%{$searchTerm}%")
            ->orWhere('location', 'LIKE', "%{$searchTerm}%")
            ->orWhere('address', 'LIKE', "%{$searchTerm}%")
            ->with(['landlord', 'images', 'rooms'])
            ->get();

        return response()->json(['properties' => $properties], 200);
    }
}
