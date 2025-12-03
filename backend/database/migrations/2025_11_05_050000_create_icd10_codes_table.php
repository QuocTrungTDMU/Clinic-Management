<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('icd10_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique(); // VD: J00, A09.0
            $table->string('name'); // Tên bệnh tiếng Việt
            $table->string('name_en')->nullable(); // Tên tiếng Anh (tham khảo)
            $table->string('category')->nullable(); // Nhóm bệnh (VD: Bệnh hô hấp)
            $table->text('description')->nullable(); // Mô tả chi tiết
            $table->string('specialty')->nullable(); // Chuyên khoa liên quan
            $table->boolean('is_common')->default(false); // Bệnh phổ biến
            $table->timestamps();

            $table->index('code');
            $table->index('is_common');
            $table->fulltext(['name', 'code']); // Để search nhanh
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('icd10_codes');
    }
};
