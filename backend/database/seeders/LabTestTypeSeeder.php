<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LabTestTypeSeeder extends Seeder
{
    public function run(): void
    {
        $labTests = [
            // Xét nghiệm máu
            [
                'code' => 'XN-001',
                'name' => 'Công thức máu',
                'category' => 'xet_nghiem',
                'description' => 'Xét nghiệm công thức máu toàn phần',
                'price' => 50000,
                'sample_type' => 'Máu tĩnh mạch',
                'duration_minutes' => 30,
                'is_active' => true
            ],
            [
                'code' => 'XN-002',
                'name' => 'Đường huyết',
                'category' => 'xet_nghiem',
                'description' => 'Xét nghiệm glucose máu',
                'price' => 30000,
                'sample_type' => 'Máu mao mạch/tĩnh mạch',
                'duration_minutes' => 15,
                'preparation_instructions' => 'Nhịn đói 8-12 giờ',
                'is_active' => true
            ],
            [
                'code' => 'XN-003',
                'name' => 'HbA1c',
                'category' => 'xet_nghiem',
                'description' => 'Đường huyết trung bình 3 tháng',
                'price' => 150000,
                'sample_type' => 'Máu tĩnh mạch',
                'duration_minutes' => 60,
                'is_active' => true
            ],
            [
                'code' => 'XN-004',
                'name' => 'Mỡ máu',
                'category' => 'xet_nghiem',
                'description' => 'Cholesterol, Triglyceride, HDL, LDL',
                'price' => 100000,
                'sample_type' => 'Máu tĩnh mạch',
                'duration_minutes' => 45,
                'preparation_instructions' => 'Nhịn đói 12-14 giờ',
                'is_active' => true
            ],
            [
                'code' => 'XN-005',
                'name' => 'Chức năng gan',
                'category' => 'xet_nghiem',
                'description' => 'SGOT, SGPT, Bilirubin',
                'price' => 120000,
                'sample_type' => 'Máu tĩnh mạch',
                'duration_minutes' => 60,
                'is_active' => true
            ],
            [
                'code' => 'XN-006',
                'name' => 'Chức năng thận',
                'category' => 'xet_nghiem',
                'description' => 'Urea, Creatinine',
                'price' => 100000,
                'sample_type' => 'Máu tĩnh mạch',
                'duration_minutes' => 45,
                'is_active' => true
            ],
            [
                'code' => 'XN-007',
                'name' => 'Nước tiểu tổng quát',
                'category' => 'xet_nghiem',
                'description' => 'Kiểm tra đường, protein, hồng cầu...',
                'price' => 40000,
                'sample_type' => 'Nước tiểu',
                'duration_minutes' => 30,
                'is_active' => true
            ],
            [
                'code' => 'XN-008',
                'name' => 'CRP',
                'category' => 'xet_nghiem',
                'description' => 'Protein phản ứng C - chỉ số viêm',
                'price' => 80000,
                'sample_type' => 'Máu tĩnh mạch',
                'duration_minutes' => 30,
                'is_active' => true
            ],

            // Chẩn đoán hình ảnh
            [
                'code' => 'XQ-001',
                'name' => 'X-quang ngực thẳng',
                'category' => 'chuan_doan_hinh_anh',
                'description' => 'Chụp X-quang phổi, tim',
                'price' => 150000,
                'sample_type' => null,
                'duration_minutes' => 30,
                'is_active' => true
            ],
            [
                'code' => 'XQ-002',
                'name' => 'X-quang cột sống',
                'category' => 'chuan_doan_hinh_anh',
                'description' => 'Chụp X-quang cột sống cổ/ngực/thắt lưng',
                'price' => 180000,
                'sample_type' => null,
                'duration_minutes' => 30,
                'is_active' => true
            ],
            [
                'code' => 'XQ-003',
                'name' => 'X-quang khớp',
                'category' => 'chuan_doan_hinh_anh',
                'description' => 'Chụp X-quang khớp gối/vai/háng...',
                'price' => 150000,
                'sample_type' => null,
                'duration_minutes' => 30,
                'is_active' => true
            ],
            [
                'code' => 'SA-001',
                'name' => 'Siêu âm bụng tổng quát',
                'category' => 'chuan_doan_hinh_anh',
                'description' => 'Siêu âm gan, mật, lách, thận...',
                'price' => 200000,
                'sample_type' => null,
                'duration_minutes' => 45,
                'preparation_instructions' => 'Nhịn ăn 6 giờ, uống đủ nước',
                'is_active' => true
            ],
            [
                'code' => 'SA-002',
                'name' => 'Siêu âm tim',
                'category' => 'chuan_doan_hinh_anh',
                'description' => 'Siêu âm Doppler tim',
                'price' => 300000,
                'sample_type' => null,
                'duration_minutes' => 60,
                'is_active' => true
            ],
            [
                'code' => 'SA-003',
                'name' => 'Siêu âm thai',
                'category' => 'chuan_doan_hinh_anh',
                'description' => 'Siêu âm sản khoa',
                'price' => 250000,
                'sample_type' => null,
                'duration_minutes' => 45,
                'is_active' => true
            ],

            // Thăm dò chức năng
            [
                'code' => 'TD-001',
                'name' => 'Điện tâm đồ',
                'category' => 'tham_do_chuc_nang',
                'description' => 'ECG - Đo hoạt động điện của tim',
                'price' => 80000,
                'sample_type' => null,
                'duration_minutes' => 20,
                'is_active' => true
            ],
            [
                'code' => 'TD-002',
                'name' => 'Đo huyết áp 24h',
                'category' => 'tham_do_chuc_nang',
                'description' => 'Holter huyết áp',
                'price' => 500000,
                'sample_type' => null,
                'duration_minutes' => 1440, // 24 giờ
                'is_active' => true
            ],
            [
                'code' => 'TD-003',
                'name' => 'Đo chức năng hô hấp',
                'category' => 'tham_do_chuc_nang',
                'description' => 'Đo thông khí phổi',
                'price' => 200000,
                'sample_type' => null,
                'duration_minutes' => 30,
                'is_active' => true
            ],
        ];

        foreach ($labTests as $test) {
            DB::table('lab_test_types')->insert([
                'code' => $test['code'],
                'name' => $test['name'],
                'category' => $test['category'],
                'description' => $test['description'],
                'price' => $test['price'],
                'sample_type' => $test['sample_type'],
                'duration_minutes' => $test['duration_minutes'],
                'preparation_instructions' => $test['preparation_instructions'] ?? null,
                'is_active' => $test['is_active'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
