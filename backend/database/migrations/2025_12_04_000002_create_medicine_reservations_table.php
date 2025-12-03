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
        Schema::create('medicine_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained()->onDelete('cascade');
            $table->foreignId('prescription_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('medicine_id')->nullable()->constrained()->onDelete('set null');

            $table->string('medicine_name'); // Tên thuốc (backup nếu medicine_id null)
            $table->integer('reserved_quantity'); // Số lượng đã trừ ảo
            $table->string('unit')->default('viên'); // Đơn vị

            $table->enum('status', ['reserved', 'dispensed', 'cancelled'])->default('reserved');
            $table->timestamp('reserved_at')->useCurrent(); // Thời gian reserve
            $table->timestamp('dispensed_at')->nullable(); // Thời gian phát thuốc thật

            $table->foreignId('reserved_by')->constrained('users')->onDelete('cascade'); // Bác sĩ reserve
            $table->foreignId('dispensed_by')->nullable()->constrained('users')->onDelete('set null'); // Dược sĩ phát

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('prescription_id');
            $table->index('medicine_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_reservations');
    }
};
