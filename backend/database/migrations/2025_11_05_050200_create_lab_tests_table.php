<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->onDelete('cascade');
            $table->foreignId('lab_test_type_id')->constrained()->onDelete('restrict');
            $table->foreignId('ordered_by')->constrained('users')->onDelete('restrict'); // Bác sĩ chỉ định
            $table->foreignId('performed_by')->nullable()->constrained('users')->onDelete('set null'); // Bác sĩ/KTV thực hiện
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->text('clinical_notes')->nullable(); // Ghi chú lâm sàng từ bác sĩ chỉ định
            $table->text('result')->nullable(); // Kết quả
            $table->text('interpretation')->nullable(); // Nhận xét của bác sĩ xét nghiệm
            $table->json('attachments')->nullable(); // File đính kèm (ảnh X-quang, kết quả...)
            $table->timestamp('ordered_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('ordered_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_tests');
    }
};
