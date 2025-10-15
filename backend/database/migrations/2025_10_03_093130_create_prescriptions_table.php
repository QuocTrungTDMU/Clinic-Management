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
            $table->foreignId('medical_record_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');

            // Prescription details
            $table->text('general_instructions')->nullable(); // Hướng dẫn chung
            $table->text('precautions')->nullable(); // Lưu ý, cảnh báo
            $table->text('diet_advice')->nullable(); // Lời khuyên về chế độ ăn
            $table->text('lifestyle_advice')->nullable(); // Lời khuyên về lối sống

            // Administrative
            $table->decimal('total_cost', 10, 2)->nullable(); // Tổng tiền thuốc
            $table->boolean('is_printed')->default(false); // Đã in chưa
            $table->timestamp('printed_at')->nullable(); // Thời gian in

            $table->timestamps();

            // Indexes
            $table->index(['medical_record_id']);
            $table->index(['patient_id', 'created_at']);
            $table->index(['doctor_id', 'created_at']);
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
