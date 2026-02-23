<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SetIntendedUrlController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'url' => 'required|string',
        ]);
        session(['url.intended' => $request->input('url')]);
        return response()->json(['success' => true]);
    }
}
