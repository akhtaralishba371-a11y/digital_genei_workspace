<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'chat_id', 'channelId', 'recipientId', 'parentId', 'userId', 'content',
        'timestamp', 'reactions', 'files', 'attachments', 'isPinned', 'repliesCount',
        'aiSummary', 'audioDuration', 'is_read', 'read_at', 'edited_at', 'is_starred',
        'link_previews', 'forwarded_from_message_id', 'forwarded_from_chat_id',
        'audio_path', 'audio_mime', 'audio_size', 'encrypted_payload', 'encryption_meta',
        'moderation_status', 'reported_at',
    ];

    // Keep embedded relation key camelCase ("user", not "user")
    public static $snakeAttributes = false;

    // Always embed the author object (frontend expects message.user)
    protected $with = ['user', 'reactionRecords'];

    protected $casts = [
        'reactions' => 'array',
        'files' => 'array',
        'attachments' => 'array',
        'link_previews' => 'array',
        /** Encrypted-at-rest envelope metadata; message secrecy depends on client-side encryption. */
        'encryption_meta' => 'encrypted:array',
        'isPinned' => 'boolean',
        'is_read' => 'boolean',
        'is_starred' => 'boolean',
        'repliesCount' => 'integer',
        'read_at' => 'datetime',
        'edited_at' => 'datetime',
        'deleted_at' => 'datetime',
        'reported_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'userId');
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function reactionRecords(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }

    public function readers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'message_reads')->withPivot('read_at');
    }

    public function markAsReadBy(User|string $user, mixed $readAt = null): void
    {
        $userId = $user instanceof User ? $user->id : $user;
        DB::table('message_reads')->upsert([[
            'message_id' => $this->id,
            'user_id' => $userId,
            'read_at' => $readAt ?? now(),
        ]], ['message_id', 'user_id'], ['read_at']);
    }

    public function isReadBy(User|string $user): bool
    {
        $userId = $user instanceof User ? $user->id : $user;
        return DB::table('message_reads')->where('message_id', $this->id)->where('user_id', $userId)->exists();
    }
}
