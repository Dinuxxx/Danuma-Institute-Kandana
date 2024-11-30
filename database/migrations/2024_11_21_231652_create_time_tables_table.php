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
        Schema::create('time_tables', function (Blueprint $table) {
            $table->increments('ttable_id');
            $table->string('day_of_week',50);
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('course_id');
        
            $table->foreign('course_id')
                ->references('course_id')
                ->on('courses')
                ->onDelete('cascade')
                ->onUpdate('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_tables');
    }
};
