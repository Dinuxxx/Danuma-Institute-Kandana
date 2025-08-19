<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only modify if you need to change the column definition
        Schema::table('teachers', function (Blueprint $table) {
            $table->decimal('salary', 10, 2)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->decimal('salary', 10, 2)->change();
        });
    }
};