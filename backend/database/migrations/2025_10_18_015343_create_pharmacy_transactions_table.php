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
        Schema::create('pharmacy_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained('prescriptions')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('pharmacist_id')->constrained('users')->onDelete('cascade'); // Dược sĩ thu tiền
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->enum('payment_method', ['cash', 'card', 'transfer', 'insurance'])->default('cash');
            $table->enum('payment_status', ['paid', 'pending', 'refunded'])->default('paid');
            $table->timestamp('transaction_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('prescription_id');
            $table->index('patient_id');
            $table->index('pharmacist_id');
            $table->index('payment_status');
            $table->index('transaction_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacy_transactions');
    }
};
