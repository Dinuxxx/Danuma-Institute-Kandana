<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ContactFormNotification;

class TestContactFormEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test-contact-form {email? : Email address to send test to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test contact form email notification';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔧 Testing Contact Form Email...');
        
        // Display current mail configuration
        $this->displayMailConfig();
        
        // Test contact form email
        $this->testContactFormEmail();
        
        $this->info('✅ Contact form email testing completed!');
        return 0;
    }
    
    private function displayMailConfig()
    {
        $this->info("\n📧 Current Mail Configuration:");
        $this->table(
            ['Setting', 'Value'],
            [
                ['Driver', config('mail.default')],
                ['Host', config('mail.mailers.smtp.host')],
                ['Port', config('mail.mailers.smtp.port')],
                ['Encryption', config('mail.mailers.smtp.encryption')],
                ['Username', config('mail.mailers.smtp.username') ? '***' . substr(config('mail.mailers.smtp.username'), -4) : 'Not set'],
                ['Password', config('mail.mailers.smtp.password') ? '***' . substr(config('mail.mailers.smtp.password'), -4) : 'Not set'],
                ['From Address', config('mail.from.address')],
                ['From Name', config('mail.from.name')],
            ]
        );
    }
    
    private function testContactFormEmail()
    {
        $this->info("\n📤 Testing Contact Form Email...");
        
        $testEmail = $this->argument('email') ?: config('mail.from.address', 'test@example.com');
        
        // Sample contact form data
        $contactData = [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'telephone' => '+94 11 234 5678',
            'message' => 'This is a test message from the contact form. I would like to inquire about your courses and admission process. Please provide more information about the available programs and their schedules.'
        ];
        
        try {
            Mail::to($testEmail)->send(new ContactFormNotification($contactData));
            
            $this->info("✅ Contact form email sent successfully to: {$testEmail}");
            $this->info("📬 Check your Mailtrap inbox to see the contact form notification");
            $this->info("📋 The email contains sample contact form data for testing");
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to send contact form email: " . $e->getMessage());
            Log::error('Contact form email test failed: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString()
            ]);
        }
    }
}
