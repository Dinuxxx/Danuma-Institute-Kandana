<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();  //auto incrementing pfimary key
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();  // Token for "remember me" functionality during authentication
            $table->timestamps(); // Automatically manages `created_at` and `updated_at`

        });

        
        //stores tokens for password reset functionality
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();  // Primary key for the email
            $table->string('token');  // Token used for resetting the password
            $table->timestamp('created_at')->nullable();   // When the token was created
        });


        // stores user session information for tracking active sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();  // Primary key for the session ID
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');   // Serialized session data
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
