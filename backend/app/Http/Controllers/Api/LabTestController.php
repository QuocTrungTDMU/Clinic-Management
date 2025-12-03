<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabTest;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LabTestController extends Controller
{
    /**
     * Create lab test order (Bác sĩ chỉ định xét nghiệm)
     * KHÔNG CẦN medical_record_id - chỉ cần appointment_id và patient_id
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'patient_id' => 'required|exists:patients,id',
            'lab_test_type_id' => 'required|exists:lab_test_types,id',
            'clinical_notes' => 'nullable|string',
        ]);

        $labTest = LabTest::create([
            'appointment_id' => $validated['appointment_id'],
            'patient_id' => $validated['patient_id'],
            'lab_test_type_id' => $validated['lab_test_type_id'],
            'ordered_by' => Auth::id(),
            'clinical_notes' => $validated['clinical_notes'] ?? null,
            'status' => 'pending',
            'ordered_at' => now(),
        ]);

        $labTest->load(['labTestType', 'orderedBy']);

        return response()->json([
            'message' => 'Đã chỉ định xét nghiệm thành công',
            'data' => $labTest
        ], 201);
    }

    /**
     * Get lab tests for appointment (TRƯỚC KHI có medical record)
     */
    public function getByAppointment($appointmentId)
    {
        $labTests = LabTest::where('appointment_id', $appointmentId)
            ->with(['labTestType', 'orderedBy', 'performedBy'])
            ->orderBy('ordered_at', 'desc')
            ->get();

        return response()->json($labTests);
    }

    /**
     * Get lab tests for medical record
     */
    public function getByMedicalRecord($medicalRecordId)
    {
        $labTests = LabTest::where('medical_record_id', $medicalRecordId)
            ->with(['labTestType', 'orderedBy', 'performedBy'])
            ->orderBy('ordered_at', 'desc')
            ->get();

        return response()->json($labTests);
    }

    /**
     * Get pending lab tests (Danh sách xét nghiệm chờ thực hiện)
     */
    public function pending(Request $request)
    {
        // Get all tests that are not cancelled (pending, in_progress, and completed for today)
        $query = LabTest::whereIn('status', ['pending', 'in_progress', 'completed'])
            ->with(['labTestType', 'orderedBy', 'appointment.patient', 'patient']);

        // Filter by category
        if ($request->has('category')) {
            $query->whereHas('labTestType', function ($q) use ($request) {
                $q->where('category', $request->category);
            });
        }

        $labTests = $query->orderBy('ordered_at', 'asc')->get();

        return response()->json($labTests);
    }

    /**
     * Update lab test status (Lab technician updates status)
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled',
        ]);

        $labTest = LabTest::findOrFail($id);

        $updateData = [
            'status' => $validated['status'],
        ];

        // If starting test, set performed_by
        if ($validated['status'] === 'in_progress' && !$labTest->performed_by) {
            $updateData['performed_by'] = Auth::id();
        }

        // If completing, set completed_at
        if ($validated['status'] === 'completed' && !$labTest->completed_at) {
            $updateData['completed_at'] = now();
        }

        $labTest->update($updateData);
        $labTest->load('labTestType', 'appointment.patient', 'patient', 'orderedBy', 'performedBy');

        return response()->json([
            'success' => true,
            'data' => $labTest
        ]);
    }

    /**
     * Update lab test result (Bác sĩ/KTV nhập kết quả)
     */
    public function updateResult(Request $request, $id)
    {
        $labTest = LabTest::findOrFail($id);

        Log::info('Update Lab Test Result Request', [
            'test_id' => $id,
            'current_status' => $labTest->status,
            'request_data' => $request->all()
        ]);

        $validated = $request->validate([
            'status' => 'required|in:in_progress,completed,cancelled',
            'result' => 'nullable|string',
            'interpretation' => 'nullable|string',
            'attachments' => 'nullable|array',
        ]);

        $updateData = [
            'status' => $validated['status'],
            'result' => $validated['result'] ?? $labTest->result,
            'interpretation' => $validated['interpretation'] ?? $labTest->interpretation,
            'performed_by' => Auth::id(),
        ];

        // If completing, set completed_at
        if ($validated['status'] === 'completed' && !$labTest->completed_at) {
            $updateData['completed_at'] = now();
        }

        if (isset($validated['attachments'])) {
            $updateData['attachments'] = $validated['attachments'];
        }

        $labTest->update($updateData);

        Log::info('Lab Test Updated', [
            'test_id' => $id,
            'new_status' => $labTest->fresh()->status,
            'update_data' => $updateData
        ]);

        $labTest->load('labTestType', 'appointment.patient', 'patient', 'orderedBy', 'performedBy');

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật kết quả xét nghiệm',
            'data' => $labTest
        ]);
    }

    /**
     * Get lab test by ID
     */
    public function show($id)
    {
        $labTest = LabTest::with([
            'labTestType',
            'orderedBy',
            'performedBy',
            'appointment.patient',
            'patient',
            'medicalRecord'
        ])->findOrFail($id);

        return response()->json($labTest);
    }

    /**
     * Delete lab test (Cancel)
     */
    public function destroy($id)
    {
        $labTest = LabTest::findOrFail($id);

        if ($labTest->status !== 'pending') {
            return response()->json([
                'message' => 'Chỉ có thể hủy xét nghiệm đang chờ'
            ], 400);
        }

        $labTest->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Đã hủy chỉ định xét nghiệm'
        ]);
    }
}
