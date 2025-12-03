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
        Schema::table('pharmacy_transactions', function (Blueprint $table) {
            // Make pharmacist_id nullable (will be set when pharmacist dispenses)
            $table->foreignId('pharmacist_id')->nullable()->change();

            // Add status column for workflow tracking
            $table->enum('status', ['paid_pending_dispensing', 'completed', 'cancelled'])
                ->default('paid_pending_dispensing')
                ->after('payment_status');

            // Add paid_amount and change_amount for cash transactions
            $table->decimal('paid_amount', 10, 2)->nullable()->after('total_amount');
            $table->decimal('change_amount', 10, 2)->nullable()->after('paid_amount');

            // Index the new status column
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacy_transactions', function (Blueprint $table) {
            $table->dropColumn(['status', 'paid_amount', 'change_amount']);

            // Revert pharmacist_id to not nullable
            $table->foreignId('pharmacist_id')->nullable(false)->change();
        });
    }
};
