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
        Schema::create('payments_courses', function (Blueprint $table) {
            $table->increments('row_id');
            $table->string('month',50);
            $table->decimal('amount', 10, 2);
            $table->string('status');
            $table->unsignedInteger('payment_id');
            $table->unsignedInteger('course_id')->nullable();
        
            $table->foreign('payment_id')
                ->references('payment_id')
                ->on('payments')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            
            $table->foreign('course_id')
                ->references('course_id')
                ->on('courses')
                ->onDelete('set null')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments_courses');
    }
};
