<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];

    public static $snakeAttributes = false;

    // Embed the editor object (frontend expects document.updatedBy as User)
    protected $with = ['updatedBy'];

    protected $casts = [
        'blocks'     => 'array',
        'isFavorite' => 'boolean',
    ];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updatedById');
    }
}
