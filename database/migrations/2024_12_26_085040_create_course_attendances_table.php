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
        Schema::create('course_attendances', function (Blueprint $table) {
            $table->increments('row_id');
            $table->string('status',50);
            $table->unsignedInteger('for_slot'); 
            $table->unsignedInteger('att_id'); 

            
            $table->foreign('for_slot')
                ->references('ttable_id')
                ->on('time_tables')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            
            $table->foreign('att_id')
                ->references('att_id')
                ->on('attendances')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_attendances');
    }
};
