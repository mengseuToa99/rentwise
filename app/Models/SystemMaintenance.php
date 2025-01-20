<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemMaintenance extends Model
{
    protected $primaryKey = 'maintenance_id';
    protected $fillable = ['maintenance_type', 'description', 'start_time', 'end_time', 'status'];
}