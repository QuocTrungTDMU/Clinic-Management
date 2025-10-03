<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;

class AppointmentTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get patients and doctors
        $patients = Patient::all();
        $doctors = User::whereHas('roles', function ($query) {
            $query->where('name', 'doctor');
        })->get();

        $receptionist = User::whereHas('roles', function ($query) {
            $query->where('name', 'receptionist');
        })->first();

        if ($patients->count() < 3 || $doctors->count() < 1 || !$receptionist) {
            $this->command->warn('Cần có ít nhất 3 patients, 1 doctor và 1 receptionist để tạo appointments test');
            return;
        }

        $today = Carbon::today();

        // Create appointments for today with different statuses
        $appointments = [
            [
                'patient_id' => $patients[0]->id,
                'doctor_id' => $doctors[0]->id,
                'created_by' => $receptionist->id,
                'appointment_datetime' => $today->copy()->setTime(9, 0),
                'status' => 'scheduled',
                'appointment_type' => 'checkup',
                'reason' => 'Khám sức khỏe định kỳ',
                'fee' => 200000,
            ],
            [
                'patient_id' => $patients[1]->id,
                'doctor_id' => $doctors[0]->id,
                'created_by' => $receptionist->id,
                'appointment_datetime' => $today->copy()->setTime(9, 30),
                'status' => 'checked_in',
                'appointment_type' => 'followup',
                'reason' => 'Tái khám sau điều trị',
                'fee' => 150000,
            ],
            [
                'patient_id' => $patients[2]->id,
                'doctor_id' => $doctors[0]->id,
                'created_by' => $receptionist->id,
                'appointment_datetime' => $today->copy()->setTime(10, 0),
                'status' => 'in_progress',
                'appointment_type' => 'consultation',
                'reason' => 'Tư vấn về kết quả xét nghiệm',
                'fee' => 100000,
            ],
        ];

        // Add more patients if available
        if ($patients->count() >= 4) {
            $appointments[] = [
                'patient_id' => $patients[0]->id, // Reuse first patient
                'doctor_id' => $doctors[0]->id,
                'created_by' => $receptionist->id,
                'appointment_datetime' => $today->copy()->setTime(10, 30),
                'status' => 'completed',
                'appointment_type' => 'checkup',
                'reason' => 'Khám bệnh theo yêu cầu',
                'fee' => 250000,
            ];
        }

        foreach ($appointments as $appointmentData) {
            Appointment::create($appointmentData);
        }

        $this->command->info('Đã tạo ' . count($appointments) . ' appointments test cho hôm nay');
    }
}
