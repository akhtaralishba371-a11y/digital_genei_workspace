<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chat extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'type', 'direct_key', 'name', 'channelId', 'encryption_enabled', 'encryption_meta'];

    protected $casts = [
        'encryption_enabled' => 'boolean',
        /** Metadata is encrypted at rest; this is not proof of end-to-end encryption. */
        'encryption_meta' => 'encrypted:array',
    ];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot(['last_read_at', 'role'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
