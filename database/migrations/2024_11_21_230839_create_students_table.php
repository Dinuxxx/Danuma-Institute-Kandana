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
        Schema::create('students', function (Blueprint $table) {
            $table->id();  //primary key
            $table->unsignedBigInteger('u_id'); //foreign key for the users table
            $table->string('grade'); //from the registration form
            $table->unsignedBigInteger('QR_id');  //foreign key for QR_codes table
            $table->unsignedBigInteger('parent_id');  //foreign key for parents table
            //$table->timestamps();


            $table->foreign('u_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('QR_id')->references('id')->on('QR_Codes')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('parents')->onDelete('cascade');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
