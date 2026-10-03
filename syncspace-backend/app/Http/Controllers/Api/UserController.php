<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    // GET /api/users
    public function index()
    {
        return User::all();
    }
}
