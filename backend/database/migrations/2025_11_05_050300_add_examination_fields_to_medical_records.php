<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            // Kiểm tra và thêm các cột chỉ khi chưa tồn tại
            if (!Schema::hasColumn('medical_records', 'blood_pressure')) {
                $table->string('blood_pressure')->nullable()->after('symptoms');
            }
            if (!Schema::hasColumn('medical_records', 'temperature')) {
                $table->decimal('temperature', 4, 1)->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'heart_rate')) {
                $table->integer('heart_rate')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'respiratory_rate')) {
                $table->integer('respiratory_rate')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'oxygen_saturation')) {
                $table->decimal('oxygen_saturation', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'weight')) {
                $table->decimal('weight', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'height')) {
                $table->decimal('height', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'bmi')) {
                $table->decimal('bmi', 4, 2)->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'icd10_id')) {
                $table->foreignId('icd10_id')->nullable()->constrained('icd10_codes')->onDelete('set null');
            }
            if (!Schema::hasColumn('medical_records', 'icd10_code')) {
                $table->string('icd10_code', 10)->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'clinical_notes')) {
                $table->text('clinical_notes')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropForeign(['icd10_id']);
            $table->dropColumn([
                'blood_pressure',
                'temperature',
                'heart_rate',
                'respiratory_rate',
                'oxygen_saturation',
                'weight',
                'height',
                'bmi',
                'icd10_id',
                'icd10_code',
                'clinical_notes'
            ]);
        });
    }
};
