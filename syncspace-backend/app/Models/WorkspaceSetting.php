<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkspaceSetting extends Model
{
    protected $guarded = [];

    protected $casts = [
        'appearance' => 'array',
        'whiteLabel' => 'array',
    ];
}
