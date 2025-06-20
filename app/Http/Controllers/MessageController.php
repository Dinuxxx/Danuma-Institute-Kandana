<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message; // Make sure the model exists
use App\Models\messages;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telephone' => 'nullable|string|max:20',
            'message' => 'required|string',
        ]);

        messages::create($validated);

        return response()->json(['message' => 'Message submitted successfully!'], 201);
    }
}


