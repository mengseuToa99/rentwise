<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Invoice;
use App\Models\RoomDetail;
use App\Models\User;

class Rental extends Model
{
    use HasFactory;

    protected $primaryKey = 'rental_id';
    protected $fillable = [
        'tenant_id',
        'room_id',
        'start_date',
        'end_date',
        'status'
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
        return $this->belongsTo(User::class, 'tenant_id', 'user_id');
    }

    /**
     * Get the invoices for the rental.
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'rental_id', 'rental_id');
    }
} 