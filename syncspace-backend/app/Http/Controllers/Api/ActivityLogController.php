<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    // GET /api/activity-logs
    public function index()
    {
        return ActivityLog::orderByDesc('timestamp')->get();
    }
}
