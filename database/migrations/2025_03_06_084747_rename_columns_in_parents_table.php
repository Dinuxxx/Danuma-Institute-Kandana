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
        Schema::table('parents', function (Blueprint $table) {
            $table->renameColumn('first_name', 'parent_first_name');
            $table->renameColumn('last_name', 'parent_last_name');
            $table->renameColumn('tel_no', 'parent_phone_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parents', function (Blueprint $table) {
            $table->renameColumn('parent_first_name', 'first_name');
            $table->renameColumn('parent_last_name', 'last_name');
            $table->renameColumn('parent_phone_number', 'tel_no');
        });
    }
};
