<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $primaryKey = 'document_id';
    protected $fillable = ['user_id', 'document_type', 'file_path'];

    public function user()
    {
        return $this->belongsTo(UserDetail::class, 'user_id');
    }
}