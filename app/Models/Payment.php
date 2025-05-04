<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payment_detail';
    protected $primaryKey = 'payment_id';
    public $timestamps = true;

    protected $fillable = [
        'invoice_id',
        'amount',
        'payment_date',
        'payment_method',
        'status',
        'created_at',
        'updated_at'
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id', 'invoice_id');
    }
} 