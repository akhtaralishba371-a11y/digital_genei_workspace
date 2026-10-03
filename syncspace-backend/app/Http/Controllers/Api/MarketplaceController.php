<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarketplaceApp;
use Illuminate\Http\Request;

class MarketplaceController extends Controller
{
    // GET /api/marketplace
    public function index()
    {
        return MarketplaceApp::all();
    }

    // PUT /api/marketplace/{id}  → install / uninstall toggle
    public function update(Request $request, string $id)
    {
        $app = MarketplaceApp::findOrFail($id);
        $app->isInstalled = $request->boolean('isInstalled');
        $app->save();

        return $app;
    }
}
