<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class UserDetail extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'user_detail';
    protected $primaryKey = 'user_id';
    
    protected $fillable = [
        'username', 
        'password_hash', 
        'email', 
        'phone_number', 
        'profile_picture', 
        'id_card_picture',
        'status', 
        'last_login', 
        'failed_login_attempts', 
        'first_name', 
        'last_name'
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    // Important: Laravel expects 'password' field but you have 'password_hash'
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
    }

    public function verification()
    {
        return $this->hasOne(UserVerification::class, 'user_id');
    }

    public function sessions()
    {
        return $this->hasMany(UserSession::class, 'user_id');
    }
}