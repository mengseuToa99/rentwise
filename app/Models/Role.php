<?php  

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $primaryKey = 'role_id';
    protected $fillable = ['role_name', 'description', 'parent_role_id'];

    public function users()
    {
        return $this->belongsToMany(UserDetail::class, 'user_roles', 'role_id', 'user_id');
    }

    public function permissions()
    {
        return $this->hasMany(AccessPermission::class, 'role_id');
    }
}