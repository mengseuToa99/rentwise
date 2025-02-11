<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RoomDetail extends Model
{
    protected $table = 'room_detail';
    protected $primaryKey = 'room_id';
    protected $fillable = [
        'property_id',
        'room_name',
        'floor_number',
        'room_number',
        'due_date',
        'room_type',
        'description',
        'available',
        'rent_amount'
    ];

    // Get occupied rooms that are due today or overdue
    public function scopeDueRooms($query)
    {
        return $query->where('available', 0)
            ->where('due_date', '<=', Carbon::now());
    }

    // Get occupied rooms that will be due within next N days
    public function scopeDueWithinDays($query, $days = 7)
    {
        return $query->where('available', 0)
            ->whereBetween('due_date', [
                Carbon::now(),
                Carbon::now()->addDays($days)
            ]);
    }

    // Get all occupied rooms with their due dates
    public function scopeOccupied($query)
    {
        return $query->where('available', 0)
            ->orderBy('due_date');
    }

    public function property()
    {
        return $this->belongsTo(PropertyDetail::class, 'property_id');
    }

    public function rentals()
    {
        return $this->hasMany(RentalDetail::class, 'room_id');
    }

    // Helper attribute to check if room is overdue
    public function getIsOverdueAttribute()
    {
        return $this->available == 0 &&
            Carbon::parse($this->due_date)->isPast();
    }
}
