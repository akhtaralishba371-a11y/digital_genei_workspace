<?php

use App\Models\Chat;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{chatId}', function ($user, string $chatId) {
    return Chat::where('id', $chatId)
        ->whereHas('members', fn ($query) => $query->where('users.id', $user->id))
        ->exists();
});

Broadcast::channel('presence.chat.{chatId}', function ($user, string $chatId) {
    if (! Chat::where('id', $chatId)->whereHas('members', fn ($query) => $query->where('users.id', $user->id))->exists()) {
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => $user->avatar,
        'status' => $user->status,
    ];
});
