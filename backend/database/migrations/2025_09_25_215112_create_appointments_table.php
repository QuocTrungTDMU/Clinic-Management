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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // receptionist who created
            $table->dateTime('appointment_datetime');
            $table->integer('duration_minutes')->default(30);
            $table->enum('status', ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'])->default('scheduled');
            $table->enum('appointment_type', ['checkup', 'followup', 'consultation', 'emergency'])->default('checkup');
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('fee', 10, 2)->nullable();
            $table->timestamps();

            // Indexes for better performance
            $table->index(['appointment_datetime', 'doctor_id']);
            $table->index(['patient_id', 'appointment_datetime']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
