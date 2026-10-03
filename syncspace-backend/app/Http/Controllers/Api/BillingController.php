<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillingConfig;

class BillingController extends Controller
{
    // GET /api/billing  → single billing config object
    public function show()
    {
        return BillingConfig::first();
    }
}
