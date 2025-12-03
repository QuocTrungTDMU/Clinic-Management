<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Cho phép tạo lab test TRƯỚC KHI có medical record
     * Lab test sẽ được link với appointment và patient
     * Khi bác sĩ hoàn thành khám và tạo medical record, sẽ update medical_record_id
     */
    public function up(): void
    {
        // Check và drop foreign key nếu tồn tại
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'lab_tests' 
            AND COLUMN_NAME = 'medical_record_id'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        if (!empty($foreignKeys)) {
            $foreignKeyName = $foreignKeys[0]->CONSTRAINT_NAME;
            DB::statement("ALTER TABLE lab_tests DROP FOREIGN KEY `{$foreignKeyName}`");
        }

        Schema::table('lab_tests', function (Blueprint $table) {
            // Thêm appointment_id và patient_id (nullable trước để migrate data cũ)
            $table->foreignId('appointment_id')->nullable()->after('id');
            $table->foreignId('patient_id')->nullable()->after('appointment_id');
        });

        // Migrate data cũ: Lấy appointment_id và patient_id từ medical_record
        DB::statement('
            UPDATE lab_tests lt
            INNER JOIN medical_records mr ON lt.medical_record_id = mr.id
            SET lt.appointment_id = mr.appointment_id,
                lt.patient_id = mr.patient_id
            WHERE lt.medical_record_id IS NOT NULL
        ');

        Schema::table('lab_tests', function (Blueprint $table) {
            // Cho phép medical_record_id NULL
            $table->unsignedBigInteger('medical_record_id')->nullable()->change();
            
            // Giờ appointment_id và patient_id bắt buộc (change to NOT NULL)
            $table->unsignedBigInteger('appointment_id')->nullable(false)->change();
            $table->unsignedBigInteger('patient_id')->nullable(false)->change();
            
            // Add foreign keys
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('medical_record_id')->references('id')->on('medical_records')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lab_tests', function (Blueprint $table) {
            // Drop foreign keys
            $table->dropForeign(['appointment_id']);
            $table->dropForeign(['patient_id']);
            $table->dropForeign(['medical_record_id']);
            
            // Remove columns
            $table->dropColumn(['appointment_id', 'patient_id']);
            
            // Restore medical_record_id as NOT NULL
            $table->foreignId('medical_record_id')->change();
            $table->foreign('medical_record_id')->references('id')->on('medical_records')->onDelete('cascade');
        });
    }
};
