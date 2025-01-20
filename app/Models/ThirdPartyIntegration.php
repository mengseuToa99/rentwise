<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThirdPartyIntegration extends Model
{
    protected $primaryKey = 'integration_id';
    protected $fillable = ['integration_name', 'api_key', 'api_url'];
}