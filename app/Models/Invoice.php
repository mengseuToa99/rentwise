<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $table = 'invoice_detail';
    protected $primaryKey = 'invoice_id';
    public $timestamps = true;

    protected $fillable = [
        'rental_id',
        'amount_due',
        'due_date',
        'paid',
        'payment_method',
        'payment_status',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'paid' => 'boolean',
        'amount_due' => 'decimal:2'
    ];

    public function rental()
    {
        return $this->belongsTo(Rental::class, 'rental_id', 'rental_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'invoice_id', 'invoice_id');
    }

    // Helper method to get pending invoices
    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }
} 