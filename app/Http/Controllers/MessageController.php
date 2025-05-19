<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\messages;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class MessageController extends Controller
{
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'telephone' => 'nullable|string',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Save to database
        messages::create([
            'name' => $request->name,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'message' => $request->message,
        ]);

        // Optional: send email notification
        Mail::raw($request->message, function ($mail) use ($request) {
            $mail->to('your-email@example.com')
                 ->subject('New Contact Message from ' . $request->name)
                 ->replyTo($request->email);
        });

        return response()->json(['message' => 'Message sent successfully!']);
    }
}

