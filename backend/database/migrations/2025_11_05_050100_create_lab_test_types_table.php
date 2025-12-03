<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_test_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // Mã xét nghiệm (VD: XN-001)
            $table->string('name'); // Tên xét nghiệm tiếng Việt
            $table->string('category'); // Loại: xet_nghiem, chuan_doan_hinh_anh, tham_do_chuc_nang
            $table->text('description')->nullable(); // Mô tả
            $table->decimal('price', 10, 2)->default(0); // Giá xét nghiệm
            $table->string('sample_type')->nullable(); // Loại mẫu (máu, nước tiểu...)
            $table->integer('duration_minutes')->default(30); // Thời gian có kết quả (phút)
            $table->text('preparation_instructions')->nullable(); // Hướng dẫn chuẩn bị
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('category');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_test_types');
    }
};
