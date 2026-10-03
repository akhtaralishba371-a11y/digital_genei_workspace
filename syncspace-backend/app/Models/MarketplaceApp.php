<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceApp extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];

    protected $casts = [
        'isInstalled'         => 'boolean',
        'rating'              => 'float',
        'reviewsCount'        => 'integer',
        'permissionsProposed' => 'array',
    ];
}
