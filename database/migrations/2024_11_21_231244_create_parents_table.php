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
        Schema::create('parents', function (Blueprint $table) {

            $table->increments('parent_id');
            $table->string('first_name',200);
            $table->string('last_name',200);
            //$table->text('address');
            $table->string('tel_no', 15);
            //$table->string('email')->unique();
            $table->string('relationship_type',50);
            
            //$table->id();
            //$table->string('first_name',250);
           // $table->string('last_name',250);
           // $table->string('relationship_type',250);
            //$table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parents');
    }
};
