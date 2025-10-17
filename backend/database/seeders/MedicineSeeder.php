<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Medicine;
use Carbon\Carbon;

class MedicineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medicines = [
            // Antibiotics
            [
                'name' => 'Amoxicillin',
                'medicine_type' => 'Capsule',
                'strength' => '500mg',
                'unit' => 'viên',
                'cost_price' => 10000,
                'selling_price' => 15000,
                'stock_quantity' => 500,
                'min_stock_alert' => 50,
                'category' => 'Antibiotics',
                'usage_instructions' => 'Uống 1 viên x 3 lần/ngày sau ăn',
                'requires_prescription' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Cephalexin',
                'medicine_type' => 'Capsule',
                'strength' => '500mg',
                'unit' => 'viên',
                'cost_price' => 12000,
                'selling_price' => 18000,
                'stock_quantity' => 300,
                'min_stock_alert' => 50,
                'category' => 'Antibiotics',
                'usage_instructions' => 'Uống 1 viên x 2 lần/ngày',
                'requires_prescription' => true,
                'status' => 'active',
            ],

            // Pain Relief
            [
                'name' => 'Paracetamol',
                'medicine_type' => 'Tablet',
                'strength' => '500mg',
                'unit' => 'viên',
                'cost_price' => 3000,
                'selling_price' => 5000,
                'stock_quantity' => 1000,
                'min_stock_alert' => 100,
                'category' => 'Pain Relief',
                'usage_instructions' => 'Uống 1-2 viên khi đau/sốt, cách 4-6 giờ',
                'requires_prescription' => false,
                'status' => 'active',
            ],
            [
                'name' => 'Ibuprofen',
                'medicine_type' => 'Tablet',
                'strength' => '400mg',
                'unit' => 'viên',
                'cost_price' => 5000,
                'selling_price' => 8000,
                'stock_quantity' => 400,
                'min_stock_alert' => 80,
                'category' => 'Pain Relief',
                'usage_instructions' => 'Uống 1 viên x 3 lần/ngày sau ăn',
                'requires_prescription' => false,
                'status' => 'active',
            ],

            // Cold & Flu
            [
                'name' => 'Tiffy',
                'medicine_type' => 'Tablet',
                'strength' => '325mg',
                'unit' => 'viên',
                'cost_price' => 2000,
                'selling_price' => 3000,
                'stock_quantity' => 600,
                'min_stock_alert' => 100,
                'category' => 'Cold & Flu',
                'usage_instructions' => 'Uống 1 viên x 3 lần/ngày',
                'requires_prescription' => false,
                'status' => 'active',
            ],
            [
                'name' => 'Decolgen',
                'medicine_type' => 'Tablet',
                'strength' => '500mg',
                'unit' => 'viên',
                'cost_price' => 2500,
                'selling_price' => 4000,
                'stock_quantity' => 500,
                'min_stock_alert' => 100,
                'category' => 'Cold & Flu',
                'usage_instructions' => 'Uống 1 viên x 3-4 lần/ngày',
                'requires_prescription' => false,
                'status' => 'active',
            ],

            // Allergy
            [
                'name' => 'Cetirizine',
                'medicine_type' => 'Tablet',
                'strength' => '10mg',
                'unit' => 'viên',
                'cost_price' => 5000,
                'selling_price' => 8000,
                'stock_quantity' => 400,
                'min_stock_alert' => 80,
                'category' => 'Allergy',
                'usage_instructions' => 'Uống 1 viên/ngày, tối trước khi ngủ',
                'requires_prescription' => false,
                'status' => 'active',
            ],
            [
                'name' => 'Loratadine',
                'medicine_type' => 'Tablet',
                'strength' => '10mg',
                'unit' => 'viên',
                'cost_price' => 4000,
                'selling_price' => 7000,
                'stock_quantity' => 350,
                'min_stock_alert' => 70,
                'category' => 'Allergy',
                'usage_instructions' => 'Uống 1 viên/ngày',
                'requires_prescription' => false,
                'status' => 'active',
            ],

            // Digestive
            [
                'name' => 'Omeprazole',
                'medicine_type' => 'Capsule',
                'strength' => '20mg',
                'unit' => 'viên',
                'cost_price' => 8000,
                'selling_price' => 12000,
                'stock_quantity' => 300,
                'min_stock_alert' => 60,
                'category' => 'Digestive',
                'usage_instructions' => 'Uống 1 viên/ngày trước ăn sáng 30 phút',
                'requires_prescription' => false,
                'status' => 'active',
            ],
            [
                'name' => 'Smecta',
                'medicine_type' => 'Powder',
                'strength' => '3g',
                'unit' => 'gói',
                'cost_price' => 5000,
                'selling_price' => 8000,
                'stock_quantity' => 400,
                'min_stock_alert' => 80,
                'category' => 'Digestive',
                'usage_instructions' => 'Uống 1 gói x 3 lần/ngày, pha với nước',
                'requires_prescription' => false,
                'status' => 'active',
            ],

            // Vitamins
            [
                'name' => 'Vitamin C',
                'medicine_type' => 'Tablet',
                'strength' => '500mg',
                'unit' => 'viên',
                'cost_price' => 3000,
                'selling_price' => 5000,
                'stock_quantity' => 800,
                'min_stock_alert' => 150,
                'category' => 'Vitamins',
                'usage_instructions' => 'Uống 1 viên/ngày sau ăn',
                'requires_prescription' => false,
                'status' => 'active',
            ],
            [
                'name' => 'Vitamin B Complex',
                'medicine_type' => 'Tablet',
                'strength' => '100mg',
                'unit' => 'viên',
                'cost_price' => 4000,
                'selling_price' => 6000,
                'stock_quantity' => 600,
                'min_stock_alert' => 120,
                'category' => 'Vitamins',
                'usage_instructions' => 'Uống 1 viên/ngày sau ăn',
                'requires_prescription' => false,
                'status' => 'active',
            ],

            // Topical
            [
                'name' => 'Gentamicin Cream',
                'medicine_type' => 'Cream',
                'strength' => '0.1%',
                'unit' => 'tuýp',
                'cost_price' => 15000,
                'selling_price' => 22000,
                'stock_quantity' => 200,
                'min_stock_alert' => 40,
                'category' => 'Topical',
                'usage_instructions' => 'Bôi mỏng lên vùng da bị nhiễm trùng 2 lần/ngày',
                'requires_prescription' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Betamethasone Cream',
                'medicine_type' => 'Cream',
                'strength' => '0.05%',
                'unit' => 'tuýp',
                'cost_price' => 18000,
                'selling_price' => 25000,
                'stock_quantity' => 150,
                'min_stock_alert' => 30,
                'category' => 'Topical',
                'usage_instructions' => 'Bôi mỏng 2 lần/ngày, không dùng lâu dài',
                'requires_prescription' => true,
                'status' => 'active',
            ],

            // Cough
            [
                'name' => 'Codein Syrup',
                'medicine_type' => 'Syrup',
                'strength' => '100ml',
                'unit' => 'chai',
                'cost_price' => 25000,
                'selling_price' => 35000,
                'stock_quantity' => 250,
                'min_stock_alert' => 50,
                'category' => 'Cough',
                'usage_instructions' => 'Uống 5ml x 3 lần/ngày',
                'requires_prescription' => true,
                'status' => 'active',
            ],
        ];

        foreach ($medicines as $medicine) {
            Medicine::create($medicine);
        }

        $this->command->info('Đã tạo ' . count($medicines) . ' loại thuốc thành công!');
    }
}
