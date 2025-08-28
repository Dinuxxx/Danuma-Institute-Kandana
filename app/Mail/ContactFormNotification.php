<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ContactFormNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $contactData;

    /**
     * Create a new message instance.
     */
    public function __construct($contactData)
    {
        $this->contactData = $contactData;
        
        // Log email creation for debugging
        Log::info('ContactFormNotification created', [
            'contact_name' => $contactData['name'] ?? 'unknown',
            'contact_email' => $contactData['email'] ?? 'unknown',
            'contact_telephone' => $contactData['telephone'] ?? 'not provided'
        ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Contact Form Submission - Danuma Institute' ,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact_form',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Build the message.
     * 
     * @deprecated Use envelope() and content() methods instead
     */
    public function build()
    {
        return $this->subject('New Contact Form Submission - Danuma Institute' )
                    ->view('emails.contact_form');
    }
}
