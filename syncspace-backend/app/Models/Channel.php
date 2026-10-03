<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Channel extends Model
{
    // String primary key (e.g. "c2"), not auto-incrementing
    public $incrementing = false;
    protected $keyType = 'string';

    // Allow all columns to be mass-assigned (dev/demo backend)
    protected $guarded = [];

    protected $casts = [
        'isPrivate'   => 'boolean',
        'unreadCount' => 'integer',
    ];
}
