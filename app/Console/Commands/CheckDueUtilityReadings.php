<?php

// Create this command with: php artisan make:command CheckDueUtilityReadings

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PropertyDetail;
use App\Services\UtilityService;

class CheckDueUtilityReadings extends Command
{
    protected $signature = 'utility:check-due-readings';
    protected $description = 'Check for rooms with due utility readings';

    public function handle(UtilityService $utilityService)
    {
        $this->info('Checking for rooms with due utility readings...');
        
        // Get all properties
        $properties = PropertyDetail::all();
        
        foreach ($properties as $property) {
            $dueRooms = $utilityService->getRoomsDueForUtilityCalculation($property->property_id);
            
            if (count($dueRooms) > 0) {
                // Send notification to property manager
                $utilityService->notifyAboutDueReadings($property->property_id, $dueRooms);
            }
        }
        
        $this->info('Done!');
        return 0;
    }
}