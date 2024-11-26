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
        Schema::create('role_modules', function (Blueprint $table) {
            $table->unsignedInteger('module_id');
            $table->unsignedInteger('role_id');
            $table->boolean('can_view')->default(false);  
            $table->boolean('can_edit')->default(false);  
            $table->boolean('can_delete')->default(false);  
            $table->boolean('can_create')->default(false);
        
        
            $table->foreign('module_id')
                ->references('module_id')
                ->on('modules')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            
            $table->foreign('role_id')
                ->references('role_id')
                ->on('roles')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            
            $table->primary(['module_id', 'role_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_modules');
    }
};
