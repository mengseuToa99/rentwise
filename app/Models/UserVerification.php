<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserVerification extends Model
{
    protected $primaryKey = 'user_id';
    protected $fillable = ['email_verified', 'phone_verified', 'verification_token', 'token_expiry'];

    public function user()
    {
        return $this->belongsTo(UserDetail::class, 'user_id');
    }
}