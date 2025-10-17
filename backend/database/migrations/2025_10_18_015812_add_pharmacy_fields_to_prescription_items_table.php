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
        Schema::table('prescription_items', function (Blueprint $table) {
            // Add medicine_id to link with medicines table
            $table->foreignId('medicine_id')->nullable()->after('prescription_id')->constrained('medicines')->onDelete('cascade');

            // Add fields for dispensing
            $table->integer('quantity_dispensed')->nullable()->after('quantity'); // Số lượng dược sĩ cấp
            $table->decimal('subtotal', 10, 2)->default(0)->after('total_price'); // Thành tiền

            // Add timing fields
            $table->boolean('morning')->default(false)->after('timing');
            $table->boolean('afternoon')->default(false)->after('morning');
            $table->boolean('evening')->default(false)->after('afternoon');
            $table->boolean('before_meal')->default(false)->after('evening');
            $table->boolean('after_meal')->default(false)->after('before_meal');

            // Index
            $table->index('medicine_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            $table->dropForeign(['medicine_id']);
            $table->dropIndex(['medicine_id']);
            $table->dropColumn([
                'medicine_id',
                'quantity_dispensed',
                'subtotal',
                'morning',
                'afternoon',
                'evening',
                'before_meal',
                'after_meal'
            ]);
        });
    }
};
