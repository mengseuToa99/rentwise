<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomDetail extends Model
{
    protected $primaryKey = 'room_id';
    protected $fillable = ['property_id', 'room_number', 'room_type', 'description', 'available', 'rent_amount'];

    public function property()
    {
        return $this->belongsTo(PropertyDetail::class, 'property_id');
    }

    public function rentals()
    {
        return $this->hasMany(RentalDetail::class, 'room_id');
    }
}