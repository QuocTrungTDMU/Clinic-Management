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
        Schema::table('appointments', function (Blueprint $table) {
            // Add specialty column after appointment_type
            $table->string('specialty')->nullable()->after('appointment_type');

            // Make doctor_id nullable since it will be auto-assigned
            $table->foreignId('doctor_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('specialty');

            // Revert doctor_id back to non-nullable
            $table->foreignId('doctor_id')->nullable(false)->change();
        });
    }
};
