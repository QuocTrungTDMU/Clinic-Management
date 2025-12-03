<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use App\Models\LabTestType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LabTestController extends Controller
{
    /**
     * Doctor orders a lab test
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medical_record_id' => 'required|exists:medical_records,id',
            'lab_test_type_id' => 'required|exists:lab_test_types,id',
            'clinical_notes' => 'nullable|string',
        ]);

        $labTest = LabTest::create([
            'medical_record_id' => $validated['medical_record_id'],
            'lab_test_type_id' => $validated['lab_test_type_id'],
            'ordered_by' => Auth::id(),
            'status' => 'pending',
            'clinical_notes' => $validated['clinical_notes'] ?? null,
        ]);

        $labTest->load('labTestType', 'orderedBy');

        return response()->json([
            'success' => true,
            'data' => $labTest
        ], 201);
    }

    /**
     * Get lab tests for a medical record
     */
    public function getByMedicalRecord($medicalRecordId)
    {
        $labTests = LabTest::where('medical_record_id', $medicalRecordId)
            ->with(['labTestType', 'orderedBy', 'performedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($labTests);
    }

    /**
     * Get pending lab tests (for lab technicians)
     */
    public function pending()
    {
        $labTests = LabTest::where('status', 'pending')
            ->orWhere('status', 'in_progress')
            ->orWhere('status', 'completed')
            ->with(['labTestType', 'medicalRecord.patient', 'orderedBy'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $labTests
        ]);
    }

    /**
     * Update lab test status only (for starting test)
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
        $labTest->load('labTestType', 'medicalRecord.patient', 'orderedBy', 'performedBy');

        return response()->json([
            'success' => true,
            'data' => $labTest
        ]);
    }

    /**
     * Lab technician updates test result
     */
    public function updateResult(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:in_progress,completed,cancelled',
            'result' => 'nullable|string',
            'interpretation' => 'nullable|string',
        ]);

        $labTest = LabTest::findOrFail($id);

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

        $labTest->update($updateData);

        $labTest->load('labTestType', 'medicalRecord.patient', 'orderedBy', 'performedBy');

        return response()->json([
            'success' => true,
            'data' => $labTest
        ]);
    }

    /**
     * Get single lab test
     */
    public function show($id)
    {
        $labTest = LabTest::with(['labTestType', 'medicalRecord.patient', 'orderedBy', 'performedBy'])
            ->findOrFail($id);

        return response()->json($labTest);
    }

    /**
     * Cancel a lab test
     */
    public function destroy($id)
    {
        $labTest = LabTest::findOrFail($id);

        if ($labTest->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a completed lab test'
            ], 400);
        }

        $labTest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lab test cancelled successfully'
        ]);
    }
}
