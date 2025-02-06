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
     * Display a listing of the properties.
     */
    public function index()
    {
        $properties = PropertyDetail::with(['landlord', 'images', 'rooms'])->get();
        return response()->json(['properties' => $properties], 200);
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
    public function show($id)
    {
        $property = PropertyDetail::with(['landlord', 'images', 'rooms'])->find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        return response()->json(['property' => $property], 200);
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
