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
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            
            // Chief complaint and examination
            $table->text('chief_complaint')->nullable(); // Lý do khám chính
            $table->text('symptoms')->nullable(); // Triệu chứng
            $table->text('physical_examination')->nullable(); // Khám lâm sàng
            $table->text('vital_signs')->nullable(); // Dấu sinh tồn (JSON)
            
            // Diagnosis and treatment
            $table->text('diagnosis')->nullable(); // Chẩn đoán
            $table->text('differential_diagnosis')->nullable(); // Chẩn đoán phân biệt
            $table->text('treatment_plan')->nullable(); // Kế hoạch điều trị
            $table->text('recommendations')->nullable(); // Lời khuyên
            
            // Follow-up
            $table->date('follow_up_date')->nullable(); // Ngày tái khám
            $table->text('follow_up_notes')->nullable(); // Ghi chú tái khám
            
            // Additional notes
            $table->text('doctor_notes')->nullable(); // Ghi chú của bác sĩ
            $table->text('patient_allergies')->nullable(); // Dị ứng của bệnh nhân
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['appointment_id']);
            $table->index(['patient_id', 'created_at']);
            $table->index(['doctor_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
