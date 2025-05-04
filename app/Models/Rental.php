<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Invoice;
use App\Models\RoomDetail;
use App\Models\User;
use App\Models\Property;
use App\Models\UserDetail;

class Rental extends Model
{
    use HasFactory;

    protected $table = 'rental_detail';
    protected $primaryKey = 'rental_id';
    public $timestamps = true;

    protected $fillable = [
        'room_id',
        'tenant_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'status',
        'created_at',
        'updated_at'
    ];

    /**
     * Get the room associated with the rental.
     */
    public function room()
    {
        return $this->belongsTo(RoomDetail::class, 'room_id', 'room_id');
    }

    /**
     * Get the tenant associated with the rental.
     */
    public function tenant()
    {
        return $this->belongsTo(UserDetail::class, 'tenant_id', 'user_id');
    }

    /**
     * Get the invoices for the rental.
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'rental_id', 'rental_id');
    }

    public function property()
    {
        return $this->hasOneThrough(
            Property::class,
            RoomDetail::class,
            'room_id', // Foreign key on room_detail table
            'property_id', // Foreign key on property_detail table
            'room_id', // Local key on rental_detail table
            'property_id' // Local key on room_detail table
        );
    }
} 