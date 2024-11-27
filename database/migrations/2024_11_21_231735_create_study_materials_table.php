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
        Schema::create('study_materials', function (Blueprint $table) {
            $table->increments('material_id');
            $table->string('material_title',200);
            $table->text('material_desc')->nullable();
            $table->string('material_path');
            $table->boolean('is_visible')->default(false);
            $table->unsignedInteger('course_id')->nullable();
        
            $table->foreign('course_id')
                ->references('course_id')
                ->on('courses')
                ->onDelete('set null')
                ->onUpdate('cascade');
                
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_materials');
    }
};
