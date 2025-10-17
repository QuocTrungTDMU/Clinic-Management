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
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->enum('status', ['pending', 'dispensed', 'cancelled'])->default('pending')->after('doctor_id');
            $table->decimal('total_amount', 10, 2)->default(0)->after('status'); // Tổng tiền (do dược sĩ tính)
            $table->foreignId('dispensed_by')->nullable()->constrained('users')->onDelete('set null')->after('total_amount'); // Dược sĩ cấp thuốc
            $table->timestamp('dispensed_at')->nullable()->after('dispensed_by'); // Thời gian cấp thuốc

            // Indexes
            $table->index('status');
            $table->index('dispensed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropForeign(['dispensed_by']);
            $table->dropIndex(['status']);
            $table->dropIndex(['dispensed_by']);
            $table->dropColumn(['status', 'total_amount', 'dispensed_by', 'dispensed_at']);
        });
    }
};
