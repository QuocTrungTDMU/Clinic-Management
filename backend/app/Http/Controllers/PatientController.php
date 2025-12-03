<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Patient::query()->with(['appointments' => function ($query) {
            $query->latest('appointment_datetime')->limit(1);
        }]);

        // Search by name if provided
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $patients = $query->orderBy('created_at', 'desc')->get();

        // Add appointments count and last visit
        $patients = $patients->map(function ($patient) {
            $lastAppointment = $patient->appointments()
                ->latest('appointment_datetime')
                ->first();

            return [
                'id' => $patient->id,
                'name' => $patient->name,
                'date_of_birth' => $patient->date_of_birth,
                'gender' => $patient->gender,
                'phone' => $patient->phone,
                'address' => $patient->address,
                'medical_history' => $patient->medical_history,
                'allergies' => $patient->allergies,
                'emergency_contact' => $patient->emergency_contact,
                'created_at' => $patient->created_at,
                'appointments_count' => $patient->appointments()->count(),
                'last_visit' => $lastAppointment ?
                    $lastAppointment->appointment_datetime->format('Y-m-d') : null,
            ];
        });

        return response()->json([
            'data' => $patients
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $patient = Patient::create($request->all());

        return response()->json($patient, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient): JsonResponse
    {
        // Load relationships
        $patient->load([
            'appointments.doctor',
            'medicalRecords.doctor',
            'medicalRecords.prescription.items.medicine'
        ]);

        return response()->json([
            'data' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'date_of_birth' => $patient->date_of_birth,
                'gender' => $patient->gender,
                'phone' => $patient->phone,
                'address' => $patient->address,
                'medical_history' => $patient->medical_history,
                'allergies' => $patient->allergies,
                'emergency_contact' => $patient->emergency_contact,
                'created_at' => $patient->created_at,
                'appointments' => $patient->appointments->sortByDesc('appointment_datetime')->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'appointment_date' => $appointment->appointment_datetime->format('Y-m-d'),
                        'appointment_time' => $appointment->appointment_datetime->format('H:i'),
                        'status' => $appointment->status,
                        'reason' => $appointment->reason,
                        'doctor_name' => $appointment->doctor?->name,
                    ];
                }),
                'medical_records' => $patient->medicalRecords->sortByDesc('created_at')->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'visit_date' => $record->created_at,
                        'diagnosis' => $record->diagnosis ?? 'N/A',
                        'symptoms' => $record->symptoms ?? 'N/A',
                        'treatment_plan' => $record->treatment_plan,
                        'notes' => $record->doctor_notes,
                        'doctor_name' => $record->doctor?->name,
                        'prescription' => $record->prescription ? [
                            'id' => $record->prescription->id,
                            'items' => $record->prescription->items->map(function ($item) {
                                return [
                                    'medicine_name' => $item->medicine?->name ?? $item->medicine_name,
                                    'dosage' => $item->dosage,
                                    'quantity' => $item->quantity,
                                    'instructions' => $item->instructions,
                                ];
                            })
                        ] : null,
                    ];
                }),
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $patient->update($request->all());

        return response()->json($patient);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully']);
    }
}
