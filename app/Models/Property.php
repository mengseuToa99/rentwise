<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $table = 'property_detail';
    protected $primaryKey = 'property_id';
    public $timestamps = true;

    protected $fillable = [
        'landlord_id',
        'name',
        'address',
        'description',
        'status',
        'created_at',
        'updated_at'
    ];

    public function landlord()
    {
        return $this->belongsTo(UserDetail::class, 'landlord_id', 'user_id');
    }

    public function units()
    {
        return $this->hasMany(Unit::class, 'property_id', 'property_id');
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class, 'property_id', 'property_id');
    }
} 