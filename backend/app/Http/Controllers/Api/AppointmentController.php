<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with(['patient', 'doctor', 'createdBy'])
            ->orderBy('appointment_datetime', 'desc');

        // Filter by date if provided
        if ($request->has('date')) {
            $query->whereDate('appointment_datetime', $request->date);
        }

        // Filter by doctor if provided
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->get();

        // Transform appointments data
        $transformedAppointments = $appointments->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'patient_name' => $appointment->patient?->name ?? 'N/A',
                'doctor_name' => $appointment->doctor?->name ?? 'N/A',
                'appointment_date' => $appointment->appointment_datetime->format('Y-m-d'),
                'appointment_time' => $appointment->appointment_datetime->format('H:i'),
                'status' => $appointment->status,
                'appointment_type' => $appointment->appointment_type,
                'reason' => $appointment->reason,
                'notes' => $appointment->notes,
                'duration_minutes' => $appointment->duration_minutes,
                'fee' => $appointment->fee,
                'created_at' => $appointment->created_at,
            ];
        });

        return response()->json([
            'data' => $transformedAppointments
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'specialty' => 'required|string|max:100',
            'appointment_datetime' => 'required|date',
            'duration_minutes' => 'integer|min:15|max:240',
            'appointment_type' => ['required', Rule::in(['checkup', 'followup', 'consultation', 'emergency'])],
            'reason' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
            'fee' => 'nullable|numeric|min:0',
        ]);

        // Auto-assign an available doctor based on specialty
        $doctor = $this->findAvailableDoctor(
            $request->specialty,
            $request->appointment_datetime,
            $request->duration_minutes ?? 30
        );

        if (!$doctor) {
            $specialtyName = $this->getSpecialtyName($request->specialty);
            return response()->json([
                'message' => "Không tìm thấy bác sĩ {$specialtyName} có lịch trống vào thời gian này. Vui lòng chọn thời gian khác."
            ], 422);
        }

        $appointment = Appointment::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => $doctor->id,
            'specialty' => $request->specialty,
            'created_by' => $request->user()->id,
            'appointment_datetime' => $request->appointment_datetime,
            'duration_minutes' => $request->duration_minutes ?? 30,
            'appointment_type' => $request->appointment_type,
            'reason' => $request->reason,
            'notes' => $request->notes,
            'fee' => $request->fee,
        ]);

        $appointment->load(['patient', 'doctor', 'createdBy']);

        $specialtyName = $this->getSpecialtyName($request->specialty);
        return response()->json([
            'message' => "Đặt lịch khám thành công! Bác sĩ {$doctor->name} ({$specialtyName}) sẽ khám vào lúc " . date('H:i d/m/Y', strtotime($request->appointment_datetime)),
            'appointment' => $appointment
        ], 201);
    }

    /**
     * Find an available doctor for the given specialty and time slot
     * Uses load-balancing: returns doctor with least appointments on that day
     */
    private function findAvailableDoctor(string $specialty, string $datetime, int $duration): ?User
    {
        // Get all active doctors with the requested specialty
        $doctors = User::whereHas('roles', function ($query) {
            $query->where('name', 'doctor');
        })
            ->where('specialization', $specialty)
            ->where('status', 'active')
            ->get();

        if ($doctors->isEmpty()) {
            return null;
        }

        $requestStart = strtotime($datetime);
        $requestEnd = $requestStart + ($duration * 60);
        $requestDate = date('Y-m-d', $requestStart);

        $availableDoctors = [];

        // Check each doctor for availability
        foreach ($doctors as $doctor) {
            // Get all appointments for this doctor on the requested date (except cancelled)
            $appointments = Appointment::where('doctor_id', $doctor->id)
                ->where('status', '!=', 'cancelled')
                ->whereDate('appointment_datetime', $requestDate)
                ->get();

            $hasConflict = false;

            // Check if the requested time slot conflicts with any existing appointment
            foreach ($appointments as $appointment) {
                $existingStart = strtotime($appointment->appointment_datetime);
                $existingEnd = $existingStart + ($appointment->duration_minutes * 60);

                // Check for overlap:
                // Two appointments overlap if one starts before the other ends
                if ($requestStart < $existingEnd && $requestEnd > $existingStart) {
                    $hasConflict = true;
                    break;
                }
            }

            if (!$hasConflict) {
                $availableDoctors[] = [
                    'doctor' => $doctor,
                    'appointment_count' => $appointments->count()
                ];
            }
        }

        // If no available doctors, return null
        if (empty($availableDoctors)) {
            return null;
        }

        // Sort by appointment count (ascending) - load balancing
        usort($availableDoctors, function ($a, $b) {
            return $a['appointment_count'] <=> $b['appointment_count'];
        });

        // Return doctor with least appointments (load balancing)
        return $availableDoctors[0]['doctor'];
    }

    /**
     * Get Vietnamese name for specialty code
     */
    private function getSpecialtyName(string $specialty): string
    {
        $specialties = [
            'internal' => 'Nội khoa',
            'surgery' => 'Ngoại khoa',
            'pediatrics' => 'Nhi khoa',
            'obstetrics' => 'Sản khoa',
            'cardiology' => 'Tim mạch',
            'dermatology' => 'Da liễu',
            'orthopedics' => 'Chấn thương chỉnh hình',
            'ophthalmology' => 'Mắt',
            'ent' => 'Tai mũi họng',
        ];

        return $specialties[$specialty] ?? $specialty;
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $appointment->load(['patient', 'doctor', 'createdBy', 'medicalRecord']);

        return response()->json([
            'data' => [
                'id' => $appointment->id,
                'patient' => [
                    'id' => $appointment->patient?->id,
                    'name' => $appointment->patient?->name,
                    'phone' => $appointment->patient?->phone,
                    'date_of_birth' => $appointment->patient?->date_of_birth,
                    'gender' => $appointment->patient?->gender,
                    'address' => $appointment->patient?->address,
                ],
                'doctor' => [
                    'id' => $appointment->doctor?->id,
                    'name' => $appointment->doctor?->name,
                    'specialization' => $appointment->doctor?->specialization,
                ],
                'created_by' => [
                    'id' => $appointment->createdBy?->id,
                    'name' => $appointment->createdBy?->name,
                ],
                'appointment_date' => $appointment->appointment_datetime->format('Y-m-d'),
                'appointment_time' => $appointment->appointment_datetime->format('H:i'),
                'appointment_datetime' => $appointment->appointment_datetime,
                'duration_minutes' => $appointment->duration_minutes,
                'status' => $appointment->status,
                'appointment_type' => $appointment->appointment_type,
                'reason' => $appointment->reason,
                'notes' => $appointment->notes,
                'fee' => $appointment->fee,
                'medical_record' => $appointment->medicalRecord ? [
                    'id' => $appointment->medicalRecord->id,
                    'diagnosis' => $appointment->medicalRecord->diagnosis,
                    'symptoms' => $appointment->medicalRecord->symptoms,
                    'treatment_plan' => $appointment->medicalRecord->treatment_plan,
                ] : null,
                'created_at' => $appointment->created_at,
                'updated_at' => $appointment->updated_at,
            ]
        ]);
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate([
            'appointment_datetime' => 'sometimes|date|after:now',
            'duration_minutes' => 'sometimes|integer|min:15|max:240',
            'status' => ['sometimes', Rule::in(['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'])],
            'appointment_type' => ['sometimes', Rule::in(['checkup', 'followup', 'consultation', 'emergency'])],
            'reason' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
            'fee' => 'nullable|numeric|min:0',
        ]);

        $appointment->update($request->only([
            'appointment_datetime',
            'duration_minutes',
            'status',
            'appointment_type',
            'reason',
            'notes',
            'fee',
        ]));

        $appointment->load(['patient', 'doctor', 'createdBy']);

        return response()->json([
            'message' => 'Cập nhật lịch hẹn thành công',
            'appointment' => $appointment
        ]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        // Instead of deleting, mark as cancelled
        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Đã hủy lịch hẹn thành công'
        ]);
    }

    // Additional methods for specific use cases
    public function getTodayAppointments(): JsonResponse
    {
        $appointments = Appointment::with(['patient', 'doctor'])
            ->whereDate('appointment_datetime', today())
            ->orderBy('appointment_datetime')
            ->get();

        return response()->json($appointments);
    }

    public function getDoctorAvailability(Request $request): JsonResponse
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
        ]);

        $appointments = Appointment::where('doctor_id', $request->doctor_id)
            ->whereDate('appointment_datetime', $request->date)
            ->where('status', '!=', 'cancelled')
            ->orderBy('appointment_datetime')
            ->get(['appointment_datetime', 'duration_minutes']);

        return response()->json([
            'appointments' => $appointments,
            'available_slots' => $this->generateAvailableSlots($request->date, $appointments)
        ]);
    }

    /**
     * Get available time slots for a specific specialty
     */
    public function getAvailableSlotsBySpecialty(Request $request): JsonResponse
    {
        $request->validate([
            'specialty' => 'required|string',
            'date' => 'required|date',
        ]);

        // Get all active doctors with the requested specialty
        $doctors = User::whereHas('roles', function ($query) {
            $query->where('name', 'doctor');
        })
            ->where('specialization', $request->specialty)
            ->where('status', 'active')
            ->get();

        if ($doctors->isEmpty()) {
            return response()->json([
                'available_slots' => [],
                'message' => 'Không có bác sĩ chuyên khoa ' . $request->specialty
            ]);
        }

        // Get all appointments for these doctors on the requested date
        $doctorIds = $doctors->pluck('id');
        $appointments = Appointment::whereIn('doctor_id', $doctorIds)
            ->whereDate('appointment_datetime', $request->date)
            ->where('status', '!=', 'cancelled')
            ->get(['appointment_datetime', 'duration_minutes', 'doctor_id']);

        // Generate available slots considering all doctors
        $availableSlots = $this->generateAvailableSlotsForSpecialty($request->date, $appointments, $doctors->count());

        return response()->json([
            'available_slots' => $availableSlots,
            'total_doctors' => $doctors->count()
        ]);
    }

    /**
     * Generate available slots considering multiple doctors for a specialty
     */
    private function generateAvailableSlotsForSpecialty($date, $appointments, $doctorCount)
    {
        // Generate time slots (9 AM to 5 PM, 30-minute slots)
        $slots = [];
        $startHour = 9;
        $endHour = 17;

        for ($hour = $startHour; $hour < $endHour; $hour++) {
            for ($minute = 0; $minute < 60; $minute += 30) {
                $timeSlot = sprintf('%02d:%02d', $hour, $minute);
                $dateTime = $date . ' ' . $timeSlot . ':00';

                // Count how many doctors are busy at this time
                $busyDoctors = $appointments->filter(function ($appointment) use ($dateTime) {
                    $appointmentStart = $appointment->appointment_datetime->format('Y-m-d H:i:s');
                    $appointmentEnd = $appointment->appointment_datetime->addMinutes($appointment->duration_minutes)->format('Y-m-d H:i:s');

                    return $dateTime >= $appointmentStart && $dateTime < $appointmentEnd;
                })->count();

                // If at least one doctor is available, include this slot
                if ($busyDoctors < $doctorCount) {
                    $slots[] = $timeSlot;
                }
            }
        }

        return $slots;
    }

    private function generateAvailableSlots($date, $appointments)
    {
        // Generate available time slots (9 AM to 5 PM, 30-minute slots)
        $slots = [];
        $startHour = 9;
        $endHour = 17;

        for ($hour = $startHour; $hour < $endHour; $hour++) {
            for ($minute = 0; $minute < 60; $minute += 30) {
                $timeSlot = sprintf('%02d:%02d', $hour, $minute);
                $dateTime = $date . ' ' . $timeSlot . ':00';

                // Check if this slot conflicts with existing appointments
                $isAvailable = !$appointments->contains(function ($appointment) use ($dateTime) {
                    $appointmentStart = $appointment->appointment_datetime->format('Y-m-d H:i:s');
                    $appointmentEnd = $appointment->appointment_datetime->addMinutes($appointment->duration_minutes)->format('Y-m-d H:i:s');

                    return $dateTime >= $appointmentStart && $dateTime < $appointmentEnd;
                });

                if ($isAvailable) {
                    $slots[] = $timeSlot;
                }
            }
        }

        return $slots;
    }

    /**
     * Get patient appointment history
     */
    public function getPatientHistory(Request $request, $patientId): JsonResponse
    {
        $patient = Patient::findOrFail($patientId);

        $query = Appointment::with(['doctor', 'createdBy'])
            ->where('patient_id', $patientId)
            ->orderBy('appointment_datetime', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range if provided
        if ($request->has('from_date')) {
            $query->whereDate('appointment_datetime', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('appointment_datetime', '<=', $request->to_date);
        }

        // Filter by doctor if provided
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        $appointments = $query->paginate(20);

        return response()->json([
            'patient' => $patient,
            'appointments' => $appointments
        ]);
    }

    /**
     * Get all appointments history with search and filters
     */
    public function getHistory(Request $request): JsonResponse
    {
        $query = Appointment::with(['patient', 'doctor', 'createdBy'])
            ->orderBy('appointment_datetime', 'desc');

        // By default, only show completed, cancelled, or no_show appointments for history
        // Unless specific status is requested
        if (!$request->has('status')) {
            $query->whereIn('status', ['completed', 'cancelled', 'no_show']);
        }

        // Search by patient name or phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('appointment_datetime', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('appointment_datetime', '<=', $request->to_date);
        }

        // Filter by doctor
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Filter by status (if explicitly provided)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by appointment type
        if ($request->has('appointment_type')) {
            $query->where('appointment_type', $request->appointment_type);
        }

        $appointments = $query->paginate(20);

        // Get summary statistics
        $stats = [
            'total_appointments' => Appointment::count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_patients' => Patient::count(),
            'total_revenue' => Appointment::where('status', 'completed')->sum('fee')
        ];

        return response()->json([
            'appointments' => $appointments,
            'stats' => $stats
        ]);
    }
}
