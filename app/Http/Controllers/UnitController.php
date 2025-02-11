<?php

namespace App\Http\Controllers;

use App\Models\PropertyDetail;
use App\Models\UtilityUsage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class UnitController extends Controller
{
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
    
                // Fetch only water reading
                $waterUsage = UtilityUsage::where('room_id', $room->room_id)
                    ->whereHas('utility', function($query) {
                        $query->where('utility_name', 'Water');
                    })
                    ->latest()
                    ->first();
                
                $electricityUsage = UtilityUsage::where('room_id', $room->room_id)
                    ->whereHas('utility', function($query) {
                        $query->where('utility_name', 'Electricity');
                    })
                    ->latest()
                    ->first();
    
                $roomData = [
                    'room_id' => $room->room_id,
                    'room_name' => $room->room_name,
                    'floor_number' => $room->floor_number,
                    'room_number' => $room->room_number,
                    'due_date' => $dueDate->format('Y-m-d'),
                    'days_until_due' => $daysUntilDue,
                    'rent_amount' => $room->rent_amount,
                    'water_reading' => $waterUsage ? $waterUsage->new_meter_reading : null,
                    'electricity_reading' => $electricityUsage ? $electricityUsage->new_meter_reading : null
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
