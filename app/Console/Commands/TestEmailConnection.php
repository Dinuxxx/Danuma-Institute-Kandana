<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\SendPasswordEmail;
use App\Models\User;

class TestEmailConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {email} {--user-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email connection and send a test email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $userId = $this->option('user-id');
        
        $this->info("Testing email connection...");
        $this->info("Target email: {$email}");
        
        // Display current mail configuration
        $this->info("\nCurrent Mail Configuration:");
        $this->info("MAIL_MAILER: " . config('mail.default'));
        $this->info("MAIL_HOST: " . config('mail.mailers.smtp.host'));
        $this->info("MAIL_PORT: " . config('mail.mailers.smtp.port'));
        $this->info("MAIL_USERNAME: " . config('mail.mailers.smtp.username'));
        $this->info("MAIL_ENCRYPTION: " . config('mail.mailers.smtp.encryption'));
        
        try {
            // Test basic connection
            $this->info("\nTesting SMTP connection...");
            
            // Try to send a simple email
            Mail::raw('This is a test email from Danuma Institute', function($message) use ($email) {
                $message->to($email)
                        ->subject('Test Email - Danuma Institute');
            });
            
            $this->info("✅ Basic email sent successfully!");
            
            // Test SendPasswordEmail if user ID is provided
            if ($userId) {
                $user = User::find($userId);
                if ($user) {
                    $this->info("\nTesting SendPasswordEmail...");
                    Mail::to($user->email)->send(new SendPasswordEmail($user, 'test123'));
                    $this->info("✅ SendPasswordEmail sent successfully!");
                } else {
                    $this->warn("⚠️ User with ID {$userId} not found");
                }
            }
            
            Log::info('Test email sent successfully', ['email' => $email]);
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to send email: " . $e->getMessage());
            Log::error('Test email failed', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Provide troubleshooting tips
            $this->error("\nTroubleshooting Tips:");
            $this->error("1. Check if your .env file has correct Mailtrap credentials");
            $this->error("2. Verify MAIL_HOST is exactly: sandbox.smtp.mailtrap.io");
            $this->error("3. Check if port 2525 is not blocked by firewall");
            $this->error("4. Try clearing config cache: php artisan config:clear");
            $this->error("5. Check Laravel logs in storage/logs/laravel.log");
        }
        
        return 0;
    }
}

