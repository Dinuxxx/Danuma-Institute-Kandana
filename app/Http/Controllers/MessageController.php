<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message; // Make sure the model exists
use App\Models\messages;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ContactFormNotification;

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

        // Save the message to database
        messages::create($validated);

        // Send email notification
        try {
            Log::info('Attempting to send contact form notification', [
                'contact_name' => $validated['name'],
                'contact_email' => $validated['email'],
                'mail_config' => [
                    'driver' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'encryption' => config('mail.mailers.smtp.encryption'),
                    'from_address' => config('mail.from.address'),
                    'from_name' => config('mail.from.name')
                ]
            ]);

            // Send email to admin (you can change this to your desired email)
            $adminEmail = config('app.admin_email', 'admin@danuma-institute.com');
            
            Mail::to($adminEmail)->send(new ContactFormNotification($validated));
            
            Log::info('Contact form notification sent successfully', [
                'contact_name' => $validated['name'],
                'contact_email' => $validated['email'],
                'sent_to' => $adminEmail
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send contact form notification: ' . $e->getMessage(), [
                'contact_name' => $validated['name'],
                'contact_email' => $validated['email'],
                'error' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'mail_config' => [
                    'driver' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'encryption' => config('mail.mailers.smtp.encryption')
                ]
            ]);
            
            // Don't fail the form submission if email fails
        }

        return response()->json(['message' => 'Message submitted successfully!'], 201);
    }
}


