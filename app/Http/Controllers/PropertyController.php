<?php

namespace App\Http\Controllers;

use App\Models\PropertyDetail;
use App\Models\RoomDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'landlord_id' => 'required|exists:user_details,id',
            'property_name' => 'required|string|max:255',
            'address' => 'required|string',
            'location' => 'required|string',
            'total_floors' => 'required|integer|min:1',
            'total_rooms' => 'required|integer|min:1',
            'description' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $property = PropertyDetail::create($request->all());
        return response()->json(['property' => $property, 'message' => 'Property created successfully'], 201);
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