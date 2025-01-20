<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Utility extends Model
{
    protected $primaryKey = 'utility_id';
    protected $fillable = ['utility_name', 'description'];

    public function prices()
    {
        return $this->hasMany(UtilityPrice::class, 'utility_id');
    }

    public function usages()
    {
        return $this->hasMany(UtilityUsage::class, 'utility_id');
    }
}