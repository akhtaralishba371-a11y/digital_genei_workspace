<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingConfig extends Model
{
    protected $guarded = [];

    protected $casts = [
        'currentSeats'      => 'integer',
        'maxSeats'          => 'integer',
        'nextInvoiceAmount' => 'float',
        'paymentMethod'     => 'array',
    ];
}
