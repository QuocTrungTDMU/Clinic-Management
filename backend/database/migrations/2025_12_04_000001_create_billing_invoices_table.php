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
        Schema::create('billing_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('medical_record_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('prescription_id')->nullable()->constrained()->onDelete('set null');

            // Billing details
            $table->decimal('consultation_fee', 10, 2)->default(0); // Phí khám
            $table->decimal('medication_cost', 10, 2)->default(0); // Tiền thuốc
            $table->decimal('lab_test_cost', 10, 2)->default(0); // Phí xét nghiệm
            $table->decimal('total_amount', 10, 2)->default(0); // Tổng cộng

            // Payment info
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->enum('payment_method', ['cash', 'card', 'transfer', 'insurance'])->nullable();
            $table->decimal('amount_paid', 10, 2)->nullable(); // Số tiền khách đưa
            $table->decimal('change_amount', 10, 2)->nullable(); // Tiền thừa

            // Who processed
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null'); // Kế toán xử lý
            $table->timestamp('paid_at')->nullable(); // Thời gian thanh toán

            // Notes
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index(['patient_id', 'created_at']);
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_invoices');
    }
};
