<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyImage extends Model
{
    protected $primaryKey = 'image_id';
    protected $fillable = ['property_id', 'image_path'];

    public function property()
    {
        return $this->belongsTo(PropertyDetail::class, 'property_id');
    }
}