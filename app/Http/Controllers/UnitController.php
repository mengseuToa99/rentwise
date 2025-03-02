<?php

namespace App\Http\Controllers;

use App\Models\PropertyDetail;
use App\Models\RoomDetail;
use App\Models\Utility;
use App\Models\UtilityUsage;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UnitController extends Controller
{

    public function getUtilityUsageByRoom($roomId)
    {
        try {
            // Verify room ownership (ensure the room belongs to a property owned by the authenticated landlord)
            $user = Auth::user()->user_id;
            $room = RoomDetail::where('room_id', $roomId)
                ->with(['property' => function ($query) use ($user) {
                    $query->where('landlord_id', $user);
                }])
                ->with(['utilityUsage.utility', 'utilityUsage.utilityPrice'])
                ->first();
    
            if (!$room || !$room->property) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Room not found or unauthorized access'
                ], 403);
            }
    
            $results = [
                'room_id' => $room->room_id,
                'room_number' => $room->room_number,
                'floor_number' => $room->floor_number,
                'utilities' => []
            ];
    
            $roomTotal = 0;
    
            foreach ($room->utilityUsage as $usage) {
                $utilityName = $usage->utility->utility_name;
                $pricePerUnit = $usage->utilityPrice->price;
                $amountUsed = $usage->amount_used;
                $billAmount = $amountUsed * $pricePerUnit;
    
                $results['utilities'][] = [
                    'utility_name' => $utilityName,
                    'old_reading' => $usage->old_meter_reading,
                    'new_reading' => $usage->new_meter_reading,
                    'amount_used' => $amountUsed,
                    'price_per_unit' => $pricePerUnit,
                    'bill_amount' => $billAmount,
                    'usage_date' => $usage->usage_date
                ];
    
                $roomTotal += $billAmount;
            }
    
            $results['total_bill'] = $roomTotal;
    
            return response()->json([
                'status' => 'success',
                'message' => 'Utility usage and price retrieved successfully',
                'data' => $results
            ], 200);
    
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateUtilityUsage(Request $request)
    {
        try {
            // Validate the incoming request structure
            $request->validate([
                'property_id' => 'required|exists:property_detail,property_id',
                'readings' => 'required|array',
                'readings.*.room_id' => 'required|integer',
                'readings.*.utilities' => 'required|array',
                'readings.*.utilities.*.utility_name' => 'required|exists:utilities,utility_name',
                'readings.*.utilities.*.new_reading' => 'required|numeric|min:0'
                // Removed usage_id validation rule since we now auto-find the record.
            ]);
    
            $user = Auth::user()->user_id;
            $propertyId = $request->property_id;
    
            // Verify property ownership
            $property = PropertyDetail::where('property_id', $propertyId)
                ->where('landlord_id', $user)
                ->first();
    
            if (!$property) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Property not found or unauthorized access'
                ], 403);
            }
    
            // Collect room IDs from request
            $requestedRoomIds = collect($request->readings)->pluck('room_id')->toArray();
    
            // Verify rooms exist and belong to the property
            $validRooms = RoomDetail::whereIn('room_id', $requestedRoomIds)
                ->where('property_id', $propertyId)
                ->pluck('room_id')
                ->toArray();
    
            $invalidRoomIds = array_diff($requestedRoomIds, $validRooms);
    
            if (!empty($invalidRoomIds)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid rooms detected',
                    'invalid_rooms' => $invalidRoomIds,
                    'detail' => 'These room IDs either do not exist or do not belong to the specified property'
                ], 422);
            }
    
            $results = [];
            
            // Fetch room details in one query
            $roomDetails = RoomDetail::whereIn('room_id', $validRooms)
                ->get()
                ->keyBy('room_id');
    
            // Fetch utility prices in one query
            $utilities = Utility::whereIn('utility_name', collect($request->readings)
                ->flatMap(fn($r) => collect($r['utilities'])->pluck('utility_name'))
                ->unique())
                ->get()
                ->keyBy('utility_name');
    
            DB::beginTransaction();
    
            foreach ($request->readings as $reading) {
                $roomId = $reading['room_id'];
                $room = $roomDetails[$roomId];
    
                $roomResult = [
                    'room_id' => $roomId,
                    'room_number' => $room->room_number,
                    'floor_number' => $room->floor_number,
                    'utilities' => []
                ];
    
                $roomTotal = 0;
    
                foreach ($reading['utilities'] as $utilityReading) {
                    $utilityName = $utilityReading['utility_name'];
                    $newReading = $utilityReading['new_reading'];
    
                    if (!isset($utilities[$utilityName])) {
                        throw new Exception("Utility '{$utilityName}' not found");
                    }
    
                    $utility = $utilities[$utilityName];
    
                    // CHANGED: Instead of using a provided usage_id, we fetch the current usage record automatically.
                    $currentUsage = UtilityUsage::where('room_id', $roomId)
                        ->where('utility_id', $utility->utility_id)
                        ->latest()
                        ->first();
    
                    if (!$currentUsage) {
                        throw new Exception("Usage record not found for room {$roomId}, utility {$utilityName}");
                    }
    
                    // Get the previous reading before the current usage record
                    $previousReading = UtilityUsage::where('room_id', $roomId)
                        ->where('utility_id', $utility->utility_id)
                        ->where('usage_date', '<', $currentUsage->usage_date)
                        ->latest()
                        ->first();
    
                    $oldReading = $previousReading ? $previousReading->new_meter_reading : 0;
    
                    // Validate reading progression
                    if ($newReading < $oldReading) {
                        throw new Exception("New reading ($newReading) cannot be less than previous reading ($oldReading) for room {$roomId}, utility {$utilityName}");
                    }
    
                    // Check next reading after the current usage record
                    $nextReading = UtilityUsage::where('room_id', $roomId)
                        ->where('utility_id', $utility->utility_id)
                        ->where('usage_date', '>', $currentUsage->usage_date)
                        ->oldest()
                        ->first();
    
                    if ($nextReading && $newReading > $nextReading->new_meter_reading) {
                        throw new Exception("New reading ($newReading) cannot be greater than next reading ({$nextReading->new_meter_reading}) for room {$roomId}, utility {$utilityName}");
                    }
    
                    $amountUsed = $newReading - $oldReading;
                    $billAmount = $amountUsed * $utility->price;
                    $roomTotal += $billAmount;
    
                    // Update the utility usage record
                    $currentUsage->update([
                        'old_meter_reading' => $oldReading,
                        'new_meter_reading' => $newReading,
                        'amount_used' => $amountUsed,
                        'price_per_unit' => $utility->price,
                        'bill_amount' => $billAmount
                    ]);
    
                    $roomResult['utilities'][] = [
                        'utility_name' => $utilityName,
                        // Removed usage_id output as it's no longer provided by the request.
                        'old_reading'    => $oldReading,
                        'new_reading'    => $newReading,
                        'amount_used'    => $amountUsed,
                        'price_per_unit' => $utility->price,
                        'bill_amount'    => $billAmount
                    ];
                }
    
                $roomResult['total_bill'] = $roomTotal;
                $results[] = $roomResult;
            }
    
            DB::commit();
    
            return response()->json([
                'status' => 'success',
                'message' => 'Utility usage updated successfully',
                'data' => $results
            ], 200);
    
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    public function calculateUtilityUsage(Request $request)
    {
        try {
            // Validate the incoming request structure
            $request->validate([
                'property_id' => 'required|exists:property_detail,property_id',
                'readings' => 'required|array',
                'readings.*.room_id' => 'required|integer',
                'readings.*.utilities' => 'required|array',
                'readings.*.utilities.*.utility_name' => 'required|exists:utilities,utility_name',
                'readings.*.utilities.*.new_reading' => 'required|numeric|min:0'
            ]);
    
            $user = Auth::user()->user_id;
            $propertyId = $request->property_id;
    
            // Verify property ownership
            $property = PropertyDetail::where('property_id', $propertyId)
                ->where('landlord_id', $user)
                ->first();
    
            if (!$property) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Property not found or unauthorized access'
                ], 403);
            }
    
            // Collect room IDs from request
            $requestedRoomIds = collect($request->readings)->pluck('room_id')->toArray();
    
            // Verify rooms exist and belong to the property
            $validRooms = RoomDetail::whereIn('room_id', $requestedRoomIds)
                ->where('property_id', $propertyId)
                ->pluck('room_id')
                ->toArray();
    
            $invalidRoomIds = array_diff($requestedRoomIds, $validRooms);
    
            if (!empty($invalidRoomIds)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid rooms detected',
                    'invalid_rooms' => $invalidRoomIds,
                    'detail' => 'These room IDs either do not exist or do not belong to the specified property'
                ], 422);
            }
    
            $results = [];
    
            // Fetch room details in one query
            $roomDetails = RoomDetail::whereIn('room_id', $validRooms)->get()->keyBy('room_id');
    
            // Fetch utility prices in one query
            $utilities = Utility::whereIn('utility_name', collect($request->readings)
                ->flatMap(fn($r) => collect($r['utilities'])->pluck('utility_name'))
                ->unique()
            )->get()->keyBy('utility_name');
    
            DB::beginTransaction();
    
            foreach ($request->readings as $reading) {
                $roomId = $reading['room_id'];
                $room = $roomDetails[$roomId];
    
                $roomResult = [
                    'room_id' => $roomId,
                    'room_number' => $room->room_number,
                    'floor_number' => $room->floor_number,
                    'utilities' => []
                ];
    
                $roomTotal = 0;
    
                foreach ($reading['utilities'] as $utilityReading) {
                    $utilityName = $utilityReading['utility_name'];
                    $newReading = $utilityReading['new_reading'];
    
                    // Get utility price
                    if (!isset($utilities[$utilityName])) {
                        throw new Exception("Utility '{$utilityName}' not found");
                    }
    
                    $utility = $utilities[$utilityName];
    
                    // Get the last reading
                    $lastReading = UtilityUsage::where('room_id', $roomId)
                        ->where('utility_id', $utility->utility_id)
                        ->latest()
                        ->first();
    
                    $oldReading = $lastReading ? $lastReading->new_meter_reading : 0;
    
                    // Validate reading progression
                    if ($newReading < $oldReading) {
                        throw new Exception("New reading ($newReading) cannot be less than previous reading ($oldReading) for room {$roomId}, utility {$utilityName}");
                    }
    
                    $amountUsed = $newReading - $oldReading;
                    $billAmount = $amountUsed * $utility->price;
                    $roomTotal += $billAmount;
    
                    // Create new utility usage record with all required fields
                    UtilityUsage::create([
                        'room_id' => $roomId,
                        'utility_id' => $utility->utility_id,
                        'old_meter_reading' => $oldReading,
                        'new_meter_reading' => $newReading,
                        'amount_used' => $amountUsed,
                        'price_per_unit' => $utility->price,
                        'bill_amount' => $billAmount,
                        'usage_date' => now()
                    ]);
    
                    $roomResult['utilities'][] = [
                        'utility_name' => $utilityName,
                        'old_reading' => $oldReading,
                        'new_reading' => $newReading,
                        'amount_used' => $amountUsed,
                        'price_per_unit' => $utility->price,
                        'bill_amount' => $billAmount
                    ];
                }
    
                $roomResult['total_bill'] = $roomTotal;
                $results[] = $roomResult;
            }
    
            DB::commit();
    
            return response()->json([
                'status' => 'success',
                'message' => 'Utility usage calculated successfully',
                'data' => $results
            ], 200);
    
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    public function getDueRooms()
    {
        $user = Auth::user()->user_id;
    
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }
    
        $properties = PropertyDetail::where('landlord_id', $user)
            ->with(['rooms' => function($query) {
                $query->where('available', 0)
                    ->orderBy('due_date')
                    ->with(['rentals' => function($q) {
                        $q->latest()->take(1);
                    }]);
            }])
            ->get();
    
        $formattedResponse = [];
        $overdue = [];
        $dueThisWeek = [];
        $upcoming = [];
    
        foreach ($properties as $property) {
            $propertyData = [
                'property_id' => $property->property_id,
                'property_name' => $property->property_name,
                'rooms' => []
            ];
    
            foreach ($property->rooms as $room) {
                $dueDate = Carbon::parse($room->due_date)->startOfDay();
                $today = Carbon::now()->startOfDay();
                $daysUntilDue = $today->diffInDays($dueDate, false);
    
                // Fetch all utilities for the room
                $utilities = Utility::all();
                $utilityReadings = [];
    
                foreach ($utilities as $utility) {
                    $latestReading = UtilityUsage::where('room_id', $room->room_id)
                        ->whereHas('utility', function($query) use ($utility) {
                            $query->where('utility_name', $utility->utility_name);
                        })
                        ->latest()
                        ->first();
    
                    $utilityReadings[$utility->utility_name] = [
                        'reading' => $latestReading ? $latestReading->new_meter_reading : null,
                        'price_per_unit' => $utility->price,
                        'last_reading_date' => $latestReading ? $latestReading->created_at->format('Y-m-d') : null
                    ];
                }
    
                $roomData = [
                    'room_id' => $room->room_id,
                    'room_name' => $room->room_name,
                    'floor_number' => $room->floor_number,
                    'room_number' => $room->room_number,
                    'room_type' => $room->room_type,
                    'description' => $room->description,
                    'due_date' => $dueDate->format('Y-m-d'),
                    'days_until_due' => $daysUntilDue,
                    'rent_amount' => $room->rent_amount,
                    'utility_readings' => $utilityReadings
                ];
    
                // Group by due date status
                if ($daysUntilDue < 0) {
                    if (!isset($overdue[$property->property_id])) {
                        $overdue[$property->property_id] = $propertyData;
                    }
                    $overdue[$property->property_id]['rooms'][] = $roomData;
                } elseif ($daysUntilDue <= 7) {
                    if (!isset($dueThisWeek[$property->property_id])) {
                        $dueThisWeek[$property->property_id] = $propertyData;
                    }
                    $dueThisWeek[$property->property_id]['rooms'][] = $roomData;
                } else {
                    if (!isset($upcoming[$property->property_id])) {
                        $upcoming[$property->property_id] = $propertyData;
                    }
                    $upcoming[$property->property_id]['rooms'][] = $roomData;
                }
            }
        }
    
        return response()->json([
            'overdue' => [
                'count' => collect($overdue)->sum(function($property) {
                    return count($property['rooms']);
                }),
                'properties' => array_values($overdue)
            ],
            'due_this_week' => [
                'count' => collect($dueThisWeek)->sum(function($property) {
                    return count($property['rooms']);
                }),
                'properties' => array_values($dueThisWeek)
            ],
            'upcoming' => [
                'count' => collect($upcoming)->sum(function($property) {
                    return count($property['rooms']);
                }),
                'properties' => array_values($upcoming)
            ],
            'total_occupied_rooms' => $properties->sum(function($property) {
                return $property->rooms->count();
            })
        ], 200);
    }
    
    // If you want to get only overdue rooms
    public function getOverdueRooms()
    {
        $user = Auth::user()->user_id;

        $overdueRooms = PropertyDetail::where('landlord_id', $user)
            ->with(['rooms' => function ($query) {
                $query->dueRooms();
            }])
            ->get();

        return response()->json([
            'overdue_rooms' => $overdueRooms
        ]);
    }

    // If you want to get rooms due within next N days
    public function getRoomsDueWithinDays(int $days = 7)
    {
        $user = Auth::user()->user_id;

        $dueRooms = PropertyDetail::where('landlord_id', $user)
            ->with(['rooms' => function ($query) use ($days) {
                $query->dueWithinDays($days);
            }])
            ->get();

        return response()->json([
            'due_rooms' => $dueRooms
        ]);
    }
}
