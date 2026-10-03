<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChannelController extends Controller
{
    // GET /api/channels
    public function index()
    {
        return Channel::all();
    }

    // POST /api/channels
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string',
            'description' => 'nullable|string',
            'isPrivate'   => 'boolean',
        ]);
        $data['id'] = 'c_' . Str::random(8);

        return Channel::create($data);
    }
}
