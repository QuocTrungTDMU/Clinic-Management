<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class QueueController extends Controller
{
    public function getTodayQueue(): JsonResponse
    {
        $today = Carbon::today();

        $appointments = Appointment::with(['patient', 'doctor'])
            ->whereDate('appointment_datetime', $today)
            ->orderBy('appointment_datetime')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient->name,
                    'doctor_name' => $appointment->doctor->name,
                    'appointment_datetime' => $appointment->appointment_datetime->toISOString(),
                    'status' => $appointment->status,
                    'appointment_type' => $appointment->appointment_type,
                    'reason' => $appointment->reason,
                    'wait_time' => $this->calculateWaitTime($appointment),
                    'estimated_time' => $this->estimateServiceTime($appointment),
                ];
            });

        return response()->json($appointments);
    }

    public function checkIn(Request $request, $appointmentId): JsonResponse
    {
        $appointment = Appointment::findOrFail($appointmentId);

        if ($appointment->status !== 'scheduled') {
            return response()->json([
                'message' => 'Chỉ có thể check-in cho lịch hẹn đã đặt'
            ], 400);
        }

        $appointment->update([
            'status' => 'checked_in',
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Check-in thành công',
            'appointment' => $appointment->load(['patient', 'doctor'])
        ]);
    }

    public function updateStatus(Request $request, $appointmentId): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:scheduled,checked_in,in_progress,completed,cancelled,no_show'
        ]);

        $appointment = Appointment::findOrFail($appointmentId);

        // Validate status transitions
        $validTransitions = [
            'scheduled' => ['checked_in', 'cancelled', 'no_show'],
            'checked_in' => ['in_progress', 'cancelled', 'no_show'],
            'in_progress' => ['completed', 'cancelled'],
            'completed' => [], // No transitions from completed
            'cancelled' => [], // No transitions from cancelled
            'no_show' => [], // No transitions from no_show
        ];

        $currentStatus = $appointment->status;
        $newStatus = $request->status;

        if (!in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
            return response()->json([
                'message' => "Không thể chuyển từ trạng thái '{$currentStatus}' sang '{$newStatus}'"
            ], 400);
        }

        $appointment->update([
            'status' => $newStatus,
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'appointment' => $appointment->load(['patient', 'doctor'])
        ]);
    }

    public function getQueueStats(): JsonResponse
    {
        $today = Carbon::today();

        $stats = Appointment::whereDate('appointment_datetime', $today)
            ->selectRaw('
                status,
                COUNT(*) as count,
                AVG(CASE 
                    WHEN status = "completed" THEN TIMESTAMPDIFF(MINUTE, appointment_datetime, updated_at)
                    ELSE NULL 
                END) as avg_service_time
            ')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $queueStats = [
            'total' => $stats->sum('count'),
            'scheduled' => $stats->get('scheduled')->count ?? 0,
            'checked_in' => $stats->get('checked_in')->count ?? 0,
            'in_progress' => $stats->get('in_progress')->count ?? 0,
            'completed' => $stats->get('completed')->count ?? 0,
            'cancelled' => $stats->get('cancelled')->count ?? 0,
            'no_show' => $stats->get('no_show')->count ?? 0,
            'avg_service_time' => round($stats->get('completed')->avg_service_time ?? 0, 1),
        ];

        return response()->json($queueStats);
    }

    private function calculateWaitTime(Appointment $appointment): int
    {
        if ($appointment->status === 'checked_in') {
            // Calculate time since check-in (using updated_at as check-in time)
            return $appointment->updated_at->diffInMinutes(now());
        } elseif ($appointment->status === 'in_progress') {
            // Calculate time since examination started
            return $appointment->updated_at->diffInMinutes(now());
        }

        return 0;
    }

    private function estimateServiceTime(Appointment $appointment): ?string
    {
        // Estimate based on appointment type
        $estimatedMinutes = match ($appointment->appointment_type) {
            'checkup' => 30,
            'followup' => 20,
            'consultation' => 15,
            'emergency' => 45,
            default => 30,
        };

        return "{$estimatedMinutes} phút";
    }

    public function getWaitingQueue(): JsonResponse
    {
        $waitingAppointments = Appointment::with(['patient', 'doctor'])
            ->whereDate('appointment_datetime', Carbon::today())
            ->whereIn('status', ['checked_in', 'in_progress'])
            ->orderBy('appointment_datetime')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient->name,
                    'doctor_name' => $appointment->doctor->name,
                    'appointment_time' => $appointment->appointment_datetime->format('H:i'),
                    'status' => $appointment->status,
                    'wait_time' => $this->calculateWaitTime($appointment),
                    'queue_position' => $this->calculateQueuePosition($appointment),
                ];
            });

        return response()->json($waitingAppointments);
    }

    private function calculateQueuePosition(Appointment $appointment): int
    {
        if ($appointment->status === 'in_progress') {
            return 0; // Currently being served
        }

        return Appointment::where('doctor_id', $appointment->doctor_id)
            ->whereDate('appointment_datetime', Carbon::today())
            ->where('status', 'checked_in')
            ->where('appointment_datetime', '<', $appointment->appointment_datetime)
            ->count() + 1;
    }

    /**
     * Get patients in examination queue for doctors
     */
    public function getDoctorQueue(Request $request): JsonResponse
    {
        $doctorId = $request->query('doctor_id') ?? Auth::id();
        
        $patientsInQueue = Appointment::with(['patient'])
            ->whereDate('appointment_datetime', Carbon::today())
            ->where('doctor_id', $doctorId)
            ->where('status', 'in_progress')
            ->orderBy('appointment_datetime')
            ->get()
            ->map(function ($appointment) {
                return [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient->id,
                    'patient_name' => $appointment->patient->name,
                    'patient_phone' => $appointment->patient->phone,
                    'patient_dob' => $appointment->patient->dob,
                    'patient_gender' => $appointment->patient->gender,
                    'appointment_time' => $appointment->appointment_datetime->format('H:i'),
                    'appointment_type' => $appointment->appointment_type,
                    'reason' => $appointment->reason,
                    'checked_in_at' => $appointment->updated_at->toISOString(),
                ];
            });

        return response()->json([
            'patients' => $patientsInQueue,
            'total_count' => $patientsInQueue->count()
        ]);
    }
}
