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
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained()->onDelete('cascade');

            // Medicine details
            $table->string('medicine_name'); // Tên thuốc
            $table->string('generic_name')->nullable(); // Tên hoạt chất
            $table->string('strength')->nullable(); // Nồng độ (500mg, 10ml, etc)
            $table->string('dosage_form')->nullable(); // Dạng bào chế (viên, gói, lọ)

            // Prescription details
            $table->string('dosage'); // Liều dùng (1 viên, 2 thìa)
            $table->string('frequency'); // Tần suất (ngày 2 lần, 8 tiếng 1 lần)
            $table->string('duration'); // Thời gian dùng (7 ngày, 2 tuần)
            $table->integer('quantity'); // Số lượng cấp
            $table->string('unit')->default('viên'); // Đơn vị (viên, gói, lọ, ống)

            // Instructions
            $table->text('instructions')->nullable(); // Cách dùng chi tiết
            $table->text('timing')->nullable(); // Thời điểm dùng (trước/sau ăn)
            $table->text('special_notes')->nullable(); // Ghi chú đặc biệt

            // Cost
            $table->decimal('unit_price', 8, 2)->nullable(); // Giá đơn vị
            $table->decimal('total_price', 10, 2)->nullable(); // Tổng tiền

            $table->timestamps();

            // Indexes
            $table->index(['prescription_id']);
            $table->index(['medicine_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
    }
};
