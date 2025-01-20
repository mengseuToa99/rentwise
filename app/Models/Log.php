<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $primaryKey = 'log_id';
    protected $fillable = ['user_id', 'action', 'description', 'timestamp'];

    public function user()
    {
        return $this->belongsTo(UserDetail::class, 'user_id');
    }
}