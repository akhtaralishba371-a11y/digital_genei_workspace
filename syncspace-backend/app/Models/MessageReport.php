<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageReport extends Model
{
    protected $guarded = [];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];
}
