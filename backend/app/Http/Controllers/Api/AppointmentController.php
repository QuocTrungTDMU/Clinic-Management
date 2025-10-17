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

        $appointments = $query->paginate(20);

        return response()->json($appointments);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'appointment_datetime' => 'required|date|after:now',
            'duration_minutes' => 'integer|min:15|max:240',
            'appointment_type' => ['required', Rule::in(['checkup', 'followup', 'consultation', 'emergency'])],
            'reason' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
            'fee' => 'nullable|numeric|min:0',
        ]);

        // Check if doctor is available at the requested time
        $conflictingAppointment = Appointment::where('doctor_id', $request->doctor_id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($request) {
                $startTime = $request->appointment_datetime;
                $endTime = date('Y-m-d H:i:s', strtotime($startTime . ' +' . ($request->duration_minutes ?? 30) . ' minutes'));

                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('appointment_datetime', '<=', $startTime)
                        ->where('appointment_datetime', '>', $endTime);
                })->orWhere(function ($q) use ($startTime, $endTime) {
                    $q->where('appointment_datetime', '<', $endTime)
                        ->where('appointment_datetime', '>=', $startTime);
                });
            })
            ->exists();

        if ($conflictingAppointment) {
            return response()->json([
                'message' => 'Bác sĩ đã có lịch hẹn vào thời gian này'
            ], 422);
        }

        $appointment = Appointment::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => $request->doctor_id,
            'created_by' => $request->user()->id,
            'appointment_datetime' => $request->appointment_datetime,
            'duration_minutes' => $request->duration_minutes ?? 30,
            'appointment_type' => $request->appointment_type,
            'reason' => $request->reason,
            'notes' => $request->notes,
            'fee' => $request->fee,
        ]);

        $appointment->load(['patient', 'doctor', 'createdBy']);

        return response()->json([
            'message' => 'Đặt lịch khám thành công',
            'appointment' => $appointment
        ], 201);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $appointment->load(['patient', 'doctor', 'createdBy']);

        return response()->json($appointment);
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
