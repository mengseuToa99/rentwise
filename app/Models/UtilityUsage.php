<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UtilityUsage extends Model
{
    protected $table = 'utility_usage';
    protected $primaryKey = 'usage_id';
    protected $fillable = ['room_id', 'utility_id', 'usage_date', 'old_meter_reading', 'new_meter_reading', 'amount_used'];

    public function room()
    {
        return $this->belongsTo(RoomDetail::class, 'room_id');
    }

    public function utility()
    {
        return $this->belongsTo(Utility::class, 'utility_id');
    }

    public function utilityPrice()
    {
        return $this->belongsTo(UtilityPrice::class, 'utility_id', 'utility_id')
            ->where('effective_date', '<=', now()) // Ensure the price is effective
            ->orderBy('effective_date', 'desc'); // Get the latest price
    }
}