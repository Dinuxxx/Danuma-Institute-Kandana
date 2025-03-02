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
        Schema::create('courses', function (Blueprint $table) {
            $table->increments('course_id');
            $table->decimal('monthly_fees', 10, 2);
            $table->string('course_name');
            $table->text('course_desc')->nullable();
            $table->string('subject');
            $table->string('grade');
            $table->unsignedInteger('teacher_id')->nullable();
            $table->timestamps();

            $table->foreign('teacher_id')
            ->references('tea_id')
            ->on('teachers')
            ->onDelete('set null')
            ->onUpdate('cascade');
        
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
