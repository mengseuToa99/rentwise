<?php 


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessPermission extends Model
{
    protected $table =  'access_permissions';
    protected $primaryKey = 'permission_id';
    protected $fillable = ['role_id', 'permission_name', 'description', 'group_id'];

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function group()
    {
        return $this->belongsTo(PermissionGroup::class, 'group_id');
    }

    public function permissionGroup()
    {
        return $this->belongsTo(PermissionGroup::class, 'group_id', 'group_id');
    }
}