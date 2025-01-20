<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Communication extends Model
{
    protected $primaryKey = 'message_id';
    protected $fillable = ['conversation_id', 'sender_id', 'receiver_id', 'message'];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function sender()
    {
        return $this->belongsTo(UserDetail::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(UserDetail::class, 'receiver_id');
    }
}