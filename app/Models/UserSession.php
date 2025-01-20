<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSession extends Model
{
    protected $primaryKey = 'session_id';
    protected $fillable = ['user_id', 'login_time', 'expiry_time', 'ip_address', 'user_agent', 'is_active'];

    public function user()
    {
        return $this->belongsTo(UserDetail::class, 'user_id');
    }
}