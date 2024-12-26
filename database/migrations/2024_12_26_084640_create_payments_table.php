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
        Schema::create('payments', function (Blueprint $table) {
            $table->increments('payment_id');
            $table->string('method',100);
            $table->string('status',50);
            $table->decimal('amount', 10, 2);
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->unsignedInteger('student_id')->nullable();
        
            $table->foreign('verified_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null')
                ->onUpdate('cascade');
           
             $table->foreign('student_id')
                ->references('student_id')
                ->on('students')
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
        Schema::dropIfExists('payments');
    }
};
