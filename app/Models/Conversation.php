<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $primaryKey = 'conversation_id';
    protected $fillable = ['subject'];

    public function messages()
    {
        return $this->hasMany(Communication::class, 'conversation_id');
    }
}