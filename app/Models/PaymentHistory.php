<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentHistory extends Model
{
    protected $primaryKey = 'payment_id';
    protected $fillable = ['invoice_id', 'payment_amount', 'payment_date', 'payment_method'];

    public function invoice()
    {
        return $this->belongsTo(InvoiceDetail::class, 'invoice_id');
    }
}