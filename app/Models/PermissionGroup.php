<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionGroup extends Model
{
    protected $primaryKey = 'group_id';
    protected $fillable = ['group_name', 'description'];

    public function permissions()
    {
        return $this->hasMany(AccessPermission::class, 'group_id');
    }
}