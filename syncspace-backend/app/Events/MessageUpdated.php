<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {
        $this->message->loadMissing(['user', 'reactionRecords']);
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('chat.'.$this->message->chat_id);
    }

    public function broadcastAs(): string
    {
        return 'message.updated';
    }
}
