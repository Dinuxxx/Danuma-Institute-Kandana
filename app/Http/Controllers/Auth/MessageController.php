<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\messages;

class MessageController extends Controller
{
    public function store(Request $request){
        //validate request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'telephone' => 'nullable|string',
            'message' => 'required|string',
        ]);

    }

    
}
