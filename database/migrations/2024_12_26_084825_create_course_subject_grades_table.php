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
        Schema::create('course_subject_grades', function (Blueprint $table) {
            $table->increments('row_id');
            $table->string('subject');
            $table->string('grade');
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
        Schema::dropIfExists('course_subject_grades');
    }
};
