<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Communication extends Model
{
    protected $table = 'communication';
    protected $primaryKey = 'message_id';
    protected $fillable = [ 'sender_id', 'receiver_id', 'message'];



    public function sender()
    {
        return $this->belongsTo(UserDetail::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(UserDetail::class, 'receiver_id');
    }
}