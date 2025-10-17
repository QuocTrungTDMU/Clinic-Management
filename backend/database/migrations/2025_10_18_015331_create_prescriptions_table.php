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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->enum('status', ['pending', 'dispensed', 'cancelled'])->default('pending');
            $table->decimal('total_amount', 10, 2)->default(0); // Tổng tiền (do dược sĩ tính)
            $table->foreignId('dispensed_by')->nullable()->constrained('users')->onDelete('set null'); // Dược sĩ cấp thuốc
            $table->timestamp('dispensed_at')->nullable(); // Thời gian cấp thuốc
            $table->text('general_instructions')->nullable(); // Hướng dẫn chung
            $table->text('precautions')->nullable(); // Lưu ý
            $table->text('diet_advice')->nullable(); // Tư vấn chế độ ăn
            $table->text('lifestyle_advice')->nullable(); // Tư vấn lối sống
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('doctor_id');
            $table->index('patient_id');
            $table->index('dispensed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
