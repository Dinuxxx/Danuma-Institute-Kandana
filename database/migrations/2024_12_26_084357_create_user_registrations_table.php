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
        Schema::create('user_registrations', function (Blueprint $table) {
            $table->increments('registration_id');
            $table->string('title');
            $table->string('first_name',250);
            $table->string('last_name',250);
            $table->string('gender', 50);
            // $table->string('email')->unique();
            $table->date('dob');
            $table->string('tel_no', 25);
            $table->text('address');
            $table->string('image')->nullable();
            $table->string('status');
            $table->unsignedBigInteger('user_id');
            $table->unsignedInteger('role_id')->nullable();
            $table->unsignedBigInteger('added_by')->nullable();
            $table->timestamps();
            
            $table ->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->onDelete('cascade')
                    ->onUpdate('cascade');
            
            $table->foreign('added_by')
                    ->references('id')
                    ->on('users')
                    ->onDelete('set null')
                    ->onUpdate('cascade');

            $table->foreign('role_id')
                    ->references('role_id')
                    ->on('roles')
                    ->onDelete('set null')
                    ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_registrations');
    }
};
