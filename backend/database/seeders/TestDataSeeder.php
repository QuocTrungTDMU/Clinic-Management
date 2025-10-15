<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\User;
use App\Models\Appointment;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some test patients
        $patient1 = Patient::create([
            'name' => 'Nguyễn Văn Nam',
            'dob' => '1990-05-15',
            'gender' => 'male',
            'phone' => '0901234567',
            'address' => '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
            'note' => 'Nhóm máu A+, Dị ứng: không'
        ]);

        $patient2 = Patient::create([
            'name' => 'Trần Thị Mai',
            'dob' => '1985-12-20',
            'gender' => 'female',
            'phone' => '0912345678',
            'address' => '456 Đường DEF, Phường UVW, Quận 3, TP.HCM',
            'note' => 'Nhóm máu B+, Dị ứng: thuốc kháng sinh'
        ]);

        $patient3 = Patient::create([
            'name' => 'Lê Minh Tuấn',
            'dob' => '1995-08-10',
            'gender' => 'male',
            'phone' => '0923456789',
            'address' => '789 Đường GHI, Phường RST, Quận 5, TP.HCM',
            'note' => 'Nhóm máu O+, Tiền sử: cao huyết áp'
        ]);

        // Get first doctor
        $doctor = User::whereHas('roles', function ($query) {
            $query->where('name', 'doctor');
        })->first();

        if ($doctor) {
            // Create appointments for today with 'in_progress' status for testing
            Appointment::create([
                'patient_id' => $patient1->id,
                'doctor_id' => $doctor->id,
                'appointment_datetime' => Carbon::today()->addHours(9),
                'appointment_type' => 'checkup',
                'reason' => 'Khám sức khỏe định kỳ',
                'status' => 'in_progress',
                'created_by' => $doctor->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Appointment::create([
                'patient_id' => $patient2->id,
                'doctor_id' => $doctor->id,
                'appointment_datetime' => Carbon::today()->addHours(10),
                'appointment_type' => 'consultation',
                'reason' => 'Đau bụng, buồn nôn',
                'status' => 'in_progress',
                'created_by' => $doctor->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Appointment::create([
                'patient_id' => $patient3->id,
                'doctor_id' => $doctor->id,
                'appointment_datetime' => Carbon::today()->addHours(11),
                'appointment_type' => 'followup',
                'reason' => 'Tái khám cao huyết áp',
                'status' => 'in_progress',
                'created_by' => $doctor->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
