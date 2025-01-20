<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UtilityPrice extends Model
{
    protected $primaryKey = 'price_id';
    protected $fillable = ['utility_id', 'price', 'effective_date'];

    public function utility()
    {
        return $this->belongsTo(Utility::class, 'utility_id');
    }
}
