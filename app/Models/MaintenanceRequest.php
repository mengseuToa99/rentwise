<?php 


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceRequest extends Model
{
    protected $primaryKey = 'request_id';
    protected $fillable = ['tenant_id', 'room_id', 'category', 'description', 'status'];

    public function tenant()
    {
        return $this->belongsTo(UserDetail::class, 'tenant_id');
    }

    public function room()
    {
        return $this->belongsTo(RoomDetail::class, 'room_id');
    }
}