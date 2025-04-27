<?php
// In app/Services/UtilityService.php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use App\Notifications\UtilityReadingsDue;
use App\Models\User;
use Carbon\Carbon;

class UtilityService
{
    /**
     * Get rooms that need utility readings based on their due date
     */
    public function getRoomsDueForUtilityCalculation($propertyId, $dueDate = null)
    {
        // Use the provided due date or default to today
        $dueDate = $dueDate ?? now()->format('Y-m-d');
        
        // Find rooms with active rentals that need utility calculations
        $rooms = DB::table('room_detail')
            ->join('rental_detail', 'room_detail.room_id', '=', 'rental_detail.room_id')
            ->join('user_detail as tenant', 'rental_detail.tenant_id', '=', 'tenant.user_id')
            ->leftJoin('invoice_detail', function($join) use ($dueDate) {
                $join->on('rental_detail.rental_id', '=', 'invoice_detail.rental_id')
                    ->whereRaw('EXTRACT(YEAR_MONTH FROM invoice_detail.created_at) = EXTRACT(YEAR_MONTH FROM ?)', [$dueDate]);
            })
            ->where('room_detail.property_id', $propertyId)
            ->whereNull('invoice_detail.invoice_id') // Only rooms without an invoice for this month
            ->where('rental_detail.start_date', '<=', $dueDate)
            ->where(function($query) use ($dueDate) {
                $query->where('rental_detail.end_date', '>=', $dueDate)
                    ->orWhereNull('rental_detail.end_date');
            })
            ->select(
                'room_detail.room_id',
                'room_detail.room_number',
                'room_detail.property_id',
                'tenant.user_id as tenant_id',
                'tenant.first_name',
                'tenant.last_name',
                'rental_detail.rental_id',
                DB::raw("'$dueDate' as readings_due_date")
            )
            ->get();

        // For each room, get the latest utility readings
        foreach ($rooms as $room) {
            $latestReadings = [];
            
            // Get utilities that are tracked for this property
            $utilities = DB::table('utilities')
                ->join('utility_usage', 'utilities.utility_id', '=', 'utility_usage.utility_id')
                ->where('utility_usage.room_id', $room->room_id)
                ->select('utilities.utility_id', 'utilities.utility_name')
                ->distinct()
                ->get();
                
            foreach ($utilities as $utility) {
                // Get the most recent reading for each utility
                $latestReading = DB::table('utility_usage')
                    ->where('room_id', $room->room_id)
                    ->where('utility_id', $utility->utility_id)
                    ->orderBy('usage_date', 'desc')
                    ->select('new_meter_reading as value', 'usage_date as date')
                    ->first();
                
                if ($latestReading) {
                    $latestReadings[$utility->utility_name] = [
                        'value' => $latestReading->value,
                        'date' => $latestReading->date
                    ];
                }
            }
            
            $room->previous_readings = $latestReadings;
        }
        
        return $rooms;
    }
    
    /**
     * Notify property manager about rooms due for utility readings
     */
    public function notifyAboutDueReadings($propertyId, $dueRooms)
    {
        // Find the property manager(s)
        $property = DB::table('property_detail')->where('property_id', $propertyId)->first();
        
        if (!$property) {
            return;
        }
        
        // Get the landlord or property managers
        $landlord = User::find($property->landlord_id);
        
        if ($landlord) {
            // Send notification
            $landlord->notify(new UtilityReadingsDue($property, $dueRooms));
        }
        
        // You could also store this in a database table for retrieval via API
        DB::table('system_settings')
            ->updateOrInsert(
                [
                    'setting_name' => 'due_utility_readings_' . $propertyId,
                ],
                [
                    'setting_value' => json_encode($dueRooms),
                    'updated_at' => now()
                ]
            );
    }
}