<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            // Add medicine info columns for when medicine is not from inventory
            $table->string('medicine_name')->after('prescription_id');
            $table->string('medicine_type')->nullable()->after('medicine_name');
            $table->string('strength')->nullable()->after('medicine_type');

            // Add quantity and total_price (keep old columns for backward compatibility)
            $table->integer('quantity')->default(1)->after('strength');
            $table->decimal('total_price', 10, 2)->default(0)->after('unit_price');
        });

        // Make medicine_id nullable after adding new columns
        DB::statement('ALTER TABLE prescription_items MODIFY medicine_id BIGINT UNSIGNED NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            $table->dropColumn(['medicine_name', 'medicine_type', 'strength', 'quantity', 'total_price']);
        });

        DB::statement('ALTER TABLE prescription_items MODIFY medicine_id BIGINT UNSIGNED NOT NULL');
    }
};
