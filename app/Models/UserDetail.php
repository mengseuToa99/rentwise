<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDetail extends Model
{
    protected $primaryKey = 'user_id';
    protected $fillable = [
        'username', 'password_hash', 'email', 'phone_number', 'profile_picture', 'id_card_picture',
        'status', 'last_login', 'failed_login_attempts', 'first_name', 'last_name'
    ];

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