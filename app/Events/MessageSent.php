<?php

namespace App\Events;

use App\Models\Communication;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The Communication instance.
     *
     * @var Communication
     */
    public $communication;

    /**
     * Create a new event instance.
     *
     * @param Communication $communication
     */
    public function __construct(Communication $communication)
    {
        $this->communication = $communication;  // This line was missing!
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Broadcast to a private channel for the receiver of the message
        return [
            new PrivateChannel("communication.{$this->communication->receiver_id}"),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        // Include the necessary data in the broadcast
        return [
            'message_id' => $this->communication->message_id,
            'sender_id' => $this->communication->sender_id,
            'receiver_id' => $this->communication->receiver_id,
            'message' => $this->communication->message,
            'created_at' => $this->communication->created_at,
            'updated_at' => $this->communication->updated_at,
        ];
    }
}