<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkspaceSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    // GET /api/settings  → { appearance, whiteLabel }
    public function show()
    {
        return WorkspaceSetting::firstOrCreate(['id' => 1]);
    }

    // PUT /api/settings  → update appearance and/or whiteLabel
    public function update(Request $request)
    {
        $settings = WorkspaceSetting::firstOrCreate(['id' => 1]);

        if ($request->has('appearance')) {
            $settings->appearance = $request->input('appearance');
        }
        if ($request->has('whiteLabel')) {
            $settings->whiteLabel = $request->input('whiteLabel');
        }
        $settings->save();

        return $settings;
    }
}
