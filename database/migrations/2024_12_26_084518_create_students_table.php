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
            $table->increments('student_id');
            $table->string('grade');
            $table->unsignedInteger('QR_id')->unique()->nullable();
            $table->unsignedInteger('parent_id')->nullable();
            $table->unsignedBigInteger('user_id');
        
            $table->foreign('QR_id')
                ->references('QR_id')
                ->on('q_r_codes')
                ->onDelete('set null')
                ->onUpdate('cascade');

            $table->foreign('parent_id')
                ->references('parent_id')
                ->on('parents')
                ->onDelete('set null')
                ->onUpdate('cascade');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            //$table->timestamps();
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
