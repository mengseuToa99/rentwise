<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyDetail extends Model
{
    protected $table = 'property_detail';
    protected $primaryKey = 'property_id';
    protected $fillable = ['landlord_id', 'property_name', 'address', 'location', 'total_floors', 'total_rooms', 'description'];

    public function landlord()
    {
        return $this->belongsTo(UserDetail::class, 'landlord_id');
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class, 'property_id');
    }

    public function rooms()
    {
        return $this->hasMany(RoomDetail::class, 'property_id');
    }
}