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
            $table->foreignId('prescription_id')->constrained('prescriptions')->onDelete('cascade');
            $table->foreignId('medicine_id')->constrained('medicines')->onDelete('cascade');
            $table->integer('quantity_prescribed'); // Số lượng bác sĩ kê
            $table->integer('quantity_dispensed')->nullable(); // Số lượng dược sĩ cấp (có thể khác nếu hết hàng)
            $table->decimal('unit_price', 10, 2)->default(0); // Giá tại thời điểm bán
            $table->decimal('subtotal', 10, 2)->default(0); // Thành tiền = quantity × unit_price
            $table->string('dosage')->nullable(); // Liều dùng: 1 viên, 2 viên...
            $table->string('frequency')->nullable(); // Tần suất: 3 lần/ngày
            $table->string('duration')->nullable(); // Thời gian: 7 ngày, 14 ngày...
            $table->text('instructions')->nullable(); // Hướng dẫn riêng cho thuốc này
            $table->boolean('morning')->default(false);
            $table->boolean('afternoon')->default(false);
            $table->boolean('evening')->default(false);
            $table->boolean('before_meal')->default(false);
            $table->boolean('after_meal')->default(false);
            $table->timestamps();

            // Indexes
            $table->index('prescription_id');
            $table->index('medicine_id');
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
