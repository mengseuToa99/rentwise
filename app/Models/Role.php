<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'role_id';
    protected $fillable = ['role_name', 'description', 'parent_role_id'];

    // Add this relationship for parent role
    public function parentRole()
    {
        return $this->belongsTo(Role::class, 'parent_role_id', 'role_id');
    }

    // Add this relationship for child roles
    public function childRoles()
    {
        return $this->hasMany(Role::class, 'parent_role_id', 'role_id');
    }

    public function users()
    {
        return $this->belongsToMany(UserDetail::class, 'user_roles', 'role_id', 'user_id');
    }

    public function permissions()
    {
        return $this->hasMany(AccessPermission::class, 'role_id');
    }
}