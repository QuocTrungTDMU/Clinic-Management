<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VisitController extends Controller
{
    /**
     * Display a listing of visits
     */
    public function index(): JsonResponse
    {
        $visits = Visit::with('patient')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($visits);
    }

    /**
     * Store a newly created visit
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'reason' => 'required|string|max:500',
            'visit_date' => 'required|date',
        ]);

        $visit = Visit::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => auth()->id(),
            'reason' => $request->reason,
            'visit_date' => $request->visit_date,
            'status' => 'pending',
        ]);

        return response()->json($visit->load('patient'), 201);
    }

    /**
     * Display the specified visit
     */
    public function show(Visit $visit): JsonResponse
    {
        return response()->json($visit->load('patient'));
    }

    /**
     * Update the specified visit
     */
    public function update(Request $request, Visit $visit): JsonResponse
    {
        $request->validate([
            'vitals' => 'nullable|array',
            'soap' => 'nullable|array',
            'status' => 'nullable|in:pending,in_progress,completed',
        ]);

        $updateData = $request->only(['status']);

        if ($request->has('vitals')) {
            $updateData['vitals'] = json_encode($request->vitals);
        }

        if ($request->has('soap')) {
            $updateData['soap_subjective'] = $request->soap['subjective'] ?? null;
            $updateData['soap_objective'] = $request->soap['objective'] ?? null;
            $updateData['soap_assessment'] = $request->soap['assessment'] ?? null;
            $updateData['soap_plan'] = $request->soap['plan'] ?? null;
        }

        $visit->update($updateData);

        return response()->json($visit->load('patient'));
    }

    /**
     * Auto-save visit data (for real-time saving)
     */
    public function autoSave(Request $request, Visit $visit): JsonResponse
    {
        $updateData = [];

        if ($request->has('vitals')) {
            $updateData['vitals'] = json_encode($request->vitals);
        }

        if ($request->has('soap')) {
            $updateData['soap_subjective'] = $request->soap['subjective'] ?? null;
            $updateData['soap_objective'] = $request->soap['objective'] ?? null;
            $updateData['soap_assessment'] = $request->soap['assessment'] ?? null;
            $updateData['soap_plan'] = $request->soap['plan'] ?? null;
        }

        if (!empty($updateData)) {
            $visit->update($updateData);
        }

        return response()->json(['message' => 'Auto-saved successfully']);
    }

    /**
     * Remove the specified visit
     */
    public function destroy(Visit $visit): JsonResponse
    {
        $visit->delete();

        return response()->json(['message' => 'Visit deleted successfully']);
    }
}
