<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('study_materials', function (Blueprint $table) {
            $table->increments('material_id');
            $table->string('material_title', 200);
            $table->text('material_desc')->nullable();
            $table->string('material_path')->nullable(); // File path for documents
            $table->string('original_filename')->nullable(); // Original filename for uploaded files
            $table->string('material_url')->nullable(); // URL for external links
            $table->string('material_url_title', 100)->nullable(); // Custom title for the URL
            $table->boolean('is_visible')->default(true);
            $table->string('course_id')->nullable();
            
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