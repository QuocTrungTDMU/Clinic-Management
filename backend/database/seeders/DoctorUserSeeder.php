<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class DoctorUserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $doctors = [
            // Nội khoa (Internal Medicine)
            [
                'email' => 'bs.nguyenvana@clinic.vn',
                'name' => 'BS. Nguyễn Văn A',
                'phone' => '0901234567',
                'specialization' => 'internal',
                'license_number' => 'BS-2024-001',
                'status' => 'active',
            ],
            [
                'email' => 'bs.tranthib@clinic.vn',
                'name' => 'BS. Trần Thị B',
                'phone' => '0901234568',
                'specialization' => 'internal',
                'license_number' => 'BS-2024-002',
                'status' => 'active',
            ],
            
            // Ngoại khoa (Surgery)
            [
                'email' => 'bs.levanc@clinic.vn',
                'name' => 'BS. Lê Văn C',
                'phone' => '0901234569',
                'specialization' => 'surgery',
                'license_number' => 'BS-2024-003',
                'status' => 'active',
            ],
            [
                'email' => 'bs.phamthid@clinic.vn',
                'name' => 'BS. Phạm Thị D',
                'phone' => '0901234570',
                'specialization' => 'surgery',
                'license_number' => 'BS-2024-004',
                'status' => 'active',
            ],
            
            // Nhi khoa (Pediatrics)
            [
                'email' => 'bs.hoangvane@clinic.vn',
                'name' => 'BS. Hoàng Văn E',
                'phone' => '0901234571',
                'specialization' => 'pediatrics',
                'license_number' => 'BS-2024-005',
                'status' => 'active',
            ],
            [
                'email' => 'bs.vuthif@clinic.vn',
                'name' => 'BS. Vũ Thị F',
                'phone' => '0901234572',
                'specialization' => 'pediatrics',
                'license_number' => 'BS-2024-006',
                'status' => 'active',
            ],
            
            // Sản khoa (Obstetrics)
            [
                'email' => 'bs.dovanh@clinic.vn',
                'name' => 'BS. Đỗ Văn H',
                'phone' => '0901234573',
                'specialization' => 'obstetrics',
                'license_number' => 'BS-2024-007',
                'status' => 'active',
            ],
            [
                'email' => 'bs.buithii@clinic.vn',
                'name' => 'BS. Bùi Thị I',
                'phone' => '0901234574',
                'specialization' => 'obstetrics',
                'license_number' => 'BS-2024-008',
                'status' => 'active',
            ],
            
            // Tim mạch (Cardiology)
            [
                'email' => 'bs.dangvank@clinic.vn',
                'name' => 'BS. Đặng Văn K',
                'phone' => '0901234575',
                'specialization' => 'cardiology',
                'license_number' => 'BS-2024-009',
                'status' => 'active',
            ],
            
            // Da liễu (Dermatology)
            [
                'email' => 'bs.ngothil@clinic.vn',
                'name' => 'BS. Ngô Thị L',
                'phone' => '0901234576',
                'specialization' => 'dermatology',
                'license_number' => 'BS-2024-010',
                'status' => 'active',
            ],
            
            // Chấn thương chỉnh hình (Orthopedics)
            [
                'email' => 'bs.duongvanm@clinic.vn',
                'name' => 'BS. Dương Văn M',
                'phone' => '0901234577',
                'specialization' => 'orthopedics',
                'license_number' => 'BS-2024-011',
                'status' => 'active',
            ],
            
            // Mắt (Ophthalmology)
            [
                'email' => 'bs.lythin@clinic.vn',
                'name' => 'BS. Lý Thị N',
                'phone' => '0901234578',
                'specialization' => 'ophthalmology',
                'license_number' => 'BS-2024-012',
                'status' => 'active',
            ],
            
            // Tai mũi họng (ENT)
            [
                'email' => 'bs.maivano@clinic.vn',
                'name' => 'BS. Mai Văn O',
                'phone' => '0901234579',
                'specialization' => 'ent',
                'license_number' => 'BS-2024-013',
                'status' => 'active',
            ],
        ];

        foreach ($doctors as $doctorData) {
            $doctor = User::firstOrCreate(
                ['email' => $doctorData['email']],
                [
                    'name' => $doctorData['name'],
                    'password' => Hash::make('doctor123'),
                    'email_verified_at' => now(),
                    'phone' => $doctorData['phone'],
                    'specialization' => $doctorData['specialization'],
                    'license_number' => $doctorData['license_number'],
                    'status' => $doctorData['status'],
                    'approved_at' => now(),
                ]
            );

            // Assign doctor role
            if (Role::where('name', 'doctor')->exists()) {
                $doctor->syncRoles(['doctor']);
            }

            echo "✓ Created: {$doctorData['name']} ({$doctorData['email']})\n";
        }

        echo "\n=== DANH SÁCH BÁC SĨ ===\n";
        echo "Tất cả tài khoản có mật khẩu: doctor123\n\n";
        echo "NỘI KHOA:\n";
        echo "- bs.nguyenvana@clinic.vn (BS. Nguyễn Văn A)\n";
        echo "- bs.tranthib@clinic.vn (BS. Trần Thị B)\n\n";
        echo "NGOẠI KHOA:\n";
        echo "- bs.levanc@clinic.vn (BS. Lê Văn C)\n";
        echo "- bs.phamthid@clinic.vn (BS. Phạm Thị D)\n\n";
        echo "NHI KHOA:\n";
        echo "- bs.hoangvane@clinic.vn (BS. Hoàng Văn E)\n";
        echo "- bs.vuthif@clinic.vn (BS. Vũ Thị F)\n\n";
        echo "SẢN KHOA:\n";
        echo "- bs.dovanh@clinic.vn (BS. Đỗ Văn H)\n";
        echo "- bs.buithii@clinic.vn (BS. Bùi Thị I)\n\n";
        echo "TIM MẠCH:\n";
        echo "- bs.dangvank@clinic.vn (BS. Đặng Văn K)\n\n";
        echo "DA LIỄU:\n";
        echo "- bs.ngothil@clinic.vn (BS. Ngô Thị L)\n\n";
        echo "CHẤN THƯƠNG CHỈNH HÌNH:\n";
        echo "- bs.duongvanm@clinic.vn (BS. Dương Văn M)\n\n";
        echo "MẮT:\n";
        echo "- bs.lythin@clinic.vn (BS. Lý Thị N)\n\n";
        echo "TAI MŨI HỌNG:\n";
        echo "- bs.maivano@clinic.vn (BS. Mai Văn O)\n";
    }
}
