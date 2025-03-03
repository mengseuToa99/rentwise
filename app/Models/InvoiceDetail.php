<?php 


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceDetail extends Model
{
    protected $table = 'invoice_detail';
    protected $primaryKey = 'invoice_id';
    protected $fillable = ['rental_id', 'amount_due', 'due_date', 'paid', 'payment_method', 'payment_status'];

    public function rental()
    {
        return $this->belongsTo(RentalDetail::class, 'rental_id');
    }
}