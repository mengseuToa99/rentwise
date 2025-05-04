<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    protected $table = 'room_detail';
    protected $primaryKey = 'room_id';
    public $timestamps = true;

    protected $fillable = [
        'property_id',
        'room_number',
        'type',
        'size',
        'rent_amount',
        'status',
        'created_at',
        'updated_at'
    ];

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id', 'property_id');
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class, 'room_id', 'room_id');
    }
} 