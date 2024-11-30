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
        Schema::create('attendances', function (Blueprint $table) {
            $table->increments('att_id'); 
            $table->timestamp('check_in_time'); 
            $table->timestamp('check_out_time')->nullable();
            $table->string('marked_method',50); 
            $table->date('date'); 
            $table->unsignedBigInteger('marked_by')->nullable(); 
            $table->unsignedInteger('student_id')->nullable(); 
            
            $table->foreign('marked_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null')
                ->onUpdate('cascade');

            $table->foreign('student_id')
                ->references('student_id')
                ->on('students')
                ->onDelete('set null')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
