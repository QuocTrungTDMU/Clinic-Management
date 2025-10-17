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
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên thuốc
            $table->string('medicine_type')->nullable(); // Loại: viên nén, viên nang, siro, tiêm...
            $table->string('strength')->nullable(); // Nồng độ: 500mg, 250mg...
            $table->string('unit')->default('viên'); // Đơn vị: viên, chai, ống, hộp...
            $table->decimal('cost_price', 10, 2)->default(0); // Giá nhập
            $table->decimal('selling_price', 10, 2)->default(0); // Giá bán
            $table->integer('stock_quantity')->default(0); // Số lượng tồn kho
            $table->integer('min_stock_alert')->default(10); // Cảnh báo khi còn ít hơn X
            $table->string('category')->nullable(); // Danh mục: Kháng sinh, Giảm đau, Hạ sốt...
            $table->text('usage_instructions')->nullable(); // Hướng dẫn sử dụng mặc định
            $table->boolean('requires_prescription')->default(false); // Cần đơn thuốc không?
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('name');
            $table->index('category');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
