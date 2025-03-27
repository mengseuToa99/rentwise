<?php

// app/Notifications/UtilityReadingsDue.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class UtilityReadingsDue extends Notification
{
    use Queueable;
    
    protected $property;
    protected $dueRooms;
    
    public function __construct($property, $dueRooms)
    {
        $this->property = $property;
        $this->dueRooms = $dueRooms;
    }
    
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }
    
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Utility Readings Due - ' . $this->property->property_name)
            ->line('You have ' . count($this->dueRooms) . ' rooms that need utility readings.')
            ->action('Enter Readings', url('/dashboard/utilities'))
            ->line('Please enter these readings soon to generate invoices.');
    }
    
    public function toDatabase($notifiable)
    {
        return [
            'property_id' => $this->property->property_id,
            'property_name' => $this->property->property_name,
            'rooms_count' => count($this->dueRooms),
            'due_date' => now()->format('Y-m-d'),
        ];
    }
}