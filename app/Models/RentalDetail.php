<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentalDetail extends Model
{
    protected $table = 'rental_detail';
    protected $primaryKey = 'rental_id';
    protected $fillable = [
        'landlord_id',
        'tenant_id',
        'room_id',
        'start_date',
        'end_date',
        'lease_agreement' // Add lease_agreement to the fillable array
    ];

    public function landlord()
    {
        return $this->belongsTo(UserDetail::class, 'landlord_id');
    }

    public function tenant()
    {
        return $this->belongsTo(UserDetail::class, 'tenant_id');
    }

    public function room()
    {
        return $this->belongsTo(RoomDetail::class, 'room_id');
    }
}