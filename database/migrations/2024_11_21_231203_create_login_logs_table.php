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
        Schema::create('login_logs', function (Blueprint $table) {
            $table->increments('llg_id');
            $table->dateTime('login_date_time');
            $table->dateTime('logout_date_time')->nullable();
            $table->string('log_ip', 200); 
            $table->string('log_status',50);
            $table->unsignedBigInteger('user_id')->nullable();
            
            
            $table ->foreign('user_id')
            ->references('id')
            ->on('users')
            ->onDelete('set null')
            ->onUpdate('cascade');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_logs');
    }
};
