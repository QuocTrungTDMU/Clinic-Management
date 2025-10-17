<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MedicalRecordController extends Controller
{
    /**
     * Display a listing of medical records for a patient
     */
    public function index(Request $request)
    {
        $patientId = $request->query('patient_id');

        $query = MedicalRecord::with(['patient', 'doctor', 'appointment', 'prescriptions.items'])
            ->orderBy('created_at', 'desc');

        if ($patientId) {
            $query->where('patient_id', $patientId);
        }

        $medicalRecords = $query->paginate(10);

        return response()->json($medicalRecords);
    }

    /**
     * Store a newly created medical record
     */
    public function store(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'patient_id' => 'required|exists:patients,id',
            'chief_complaint' => 'required|string',
            'symptoms' => 'nullable|string',
            'physical_examination' => 'nullable|string',
            'vital_signs' => 'nullable|array',
            'diagnosis' => 'required|string',
            'treatment_plan' => 'nullable|string',
            'follow_up_date' => 'nullable|date',
            'notes' => 'nullable|string',

            // Prescription data
            'prescription' => 'nullable|array',
            'prescription.general_instructions' => 'nullable|string',
            'prescription.precautions' => 'nullable|string',
            'prescription.diet_advice' => 'nullable|string',
            'prescription.lifestyle_advice' => 'nullable|string',
            'prescription.items' => 'nullable|array',
            'prescription.items.*.medicine_name' => 'required_with:prescription.items|string',
            'prescription.items.*.strength' => 'nullable|string',
            'prescription.items.*.dosage' => 'required_with:prescription.items|string',
            'prescription.items.*.frequency' => 'required_with:prescription.items|string',
            'prescription.items.*.duration' => 'required_with:prescription.items|string',
            'prescription.items.*.quantity' => 'required_with:prescription.items|integer|min:1',
            'prescription.items.*.unit_price' => 'nullable|numeric|min:0',
            'prescription.items.*.instructions' => 'nullable|string',
            'prescription.items.*.morning' => 'nullable|boolean',
            'prescription.items.*.afternoon' => 'nullable|boolean',
            'prescription.items.*.evening' => 'nullable|boolean',
            'prescription.items.*.before_meal' => 'nullable|boolean',
            'prescription.items.*.after_meal' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            // Create medical record
            $medicalRecord = MedicalRecord::create([
                'appointment_id' => $request->appointment_id,
                'patient_id' => $request->patient_id,
                'doctor_id' => Auth::id(),
                'chief_complaint' => $request->chief_complaint,
                'symptoms' => $request->symptoms,
                'physical_examination' => $request->physical_examination,
                'vital_signs' => $request->vital_signs,
                'diagnosis' => $request->diagnosis,
                'treatment_plan' => $request->treatment_plan,
                'follow_up_date' => $request->follow_up_date,
                'notes' => $request->notes,
            ]);

            // Create prescription if provided
            if ($request->has('prescription') && !empty($request->prescription)) {
                $prescriptionData = $request->prescription;

                $prescription = Prescription::create([
                    'medical_record_id' => $medicalRecord->id,
                    'patient_id' => $request->patient_id,
                    'doctor_id' => Auth::id(),
                    'general_instructions' => $prescriptionData['general_instructions'] ?? null,
                    'precautions' => $prescriptionData['precautions'] ?? null,
                    'diet_advice' => $prescriptionData['diet_advice'] ?? null,
                    'lifestyle_advice' => $prescriptionData['lifestyle_advice'] ?? null,
                ]);

                // Create prescription items
                if (!empty($prescriptionData['items'])) {
                    $totalCost = 0;

                    foreach ($prescriptionData['items'] as $item) {
                        $unitPrice = $item['unit_price'] ?? 0;
                        $quantity = $item['quantity'];
                        $totalPrice = $unitPrice * $quantity;
                        $totalCost += $totalPrice;

                        PrescriptionItem::create([
                            'prescription_id' => $prescription->id,
                            'medicine_name' => $item['medicine_name'],
                            'medicine_type' => $item['medicine_type'] ?? null,
                            'strength' => $item['strength'] ?? null,
                            'dosage' => $item['dosage'],
                            'frequency' => $item['frequency'],
                            'duration' => $item['duration'],
                            'quantity' => $quantity,
                            'unit_price' => $unitPrice,
                            'total_price' => $totalPrice,
                            'instructions' => $item['instructions'] ?? null,
                            'morning' => $item['morning'] ?? false,
                            'afternoon' => $item['afternoon'] ?? false,
                            'evening' => $item['evening'] ?? false,
                            'before_meal' => $item['before_meal'] ?? false,
                            'after_meal' => $item['after_meal'] ?? false,
                        ]);
                    }

                    // Update prescription total cost
                    $prescription->update(['total_cost' => $totalCost]);
                }
            }

            // Update appointment status to completed
            $appointment = Appointment::find($request->appointment_id);
            if ($appointment) {
                $appointment->update(['status' => 'completed']);
            }

            DB::commit();

            // Load relationships for response
            $medicalRecord->load(['patient', 'doctor', 'appointment', 'prescriptions.items']);

            return response()->json([
                'message' => 'Medical record created successfully',
                'data' => $medicalRecord
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create medical record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified medical record
     */
    public function show(MedicalRecord $medicalRecord)
    {
        $medicalRecord->load(['patient', 'doctor', 'appointment', 'prescriptions.items']);

        return response()->json($medicalRecord);
    }

    /**
     * Update the specified medical record
     */
    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        $request->validate([
            'chief_complaint' => 'required|string',
            'symptoms' => 'nullable|string',
            'physical_examination' => 'nullable|string',
            'vital_signs' => 'nullable|array',
            'diagnosis' => 'required|string',
            'treatment_plan' => 'nullable|string',
            'follow_up_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $medicalRecord->update($request->only([
            'chief_complaint',
            'symptoms',
            'physical_examination',
            'vital_signs',
            'diagnosis',
            'treatment_plan',
            'follow_up_date',
            'notes',
        ]));

        $medicalRecord->load(['patient', 'doctor', 'appointment', 'prescriptions.items']);

        return response()->json([
            'message' => 'Medical record updated successfully',
            'data' => $medicalRecord
        ]);
    }

    /**
     * Remove the specified medical record
     */
    public function destroy(MedicalRecord $medicalRecord)
    {
        $medicalRecord->delete();

        return response()->json([
            'message' => 'Medical record deleted successfully'
        ]);
    }

    /**
     * Get patient's medical history
     */
    public function getPatientMedicalHistory($patientId)
    {
        $medicalRecords = MedicalRecord::with(['doctor', 'appointment', 'prescriptions.items'])
            ->where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'visit_date' => $record->created_at->format('Y-m-d'),
                    'doctor_name' => $record->doctor->name,
                    'chief_complaint' => $record->chief_complaint,
                    'diagnosis' => $record->diagnosis,
                    'treatment_plan' => $record->treatment_plan,
                    'vital_signs' => $record->vital_signs,
                    'prescriptions' => $record->prescriptions->map(function ($prescription) {
                        return [
                            'id' => $prescription->id,
                            'medications' => $prescription->items->map(function ($item) {
                                return [
                                    'medicine_name' => $item->medicine_name,
                                    'strength' => $item->strength,
                                    'dosage' => $item->dosage,
                                    'frequency' => $item->frequency,
                                    'duration' => $item->duration,
                                ];
                            }),
                            'general_instructions' => $prescription->general_instructions,
                        ];
                    }),
                    'full_record' => $record, // Include full record for detailed view
                ];
            });

        return response()->json([
            'patient_id' => $patientId,
            'total_visits' => $medicalRecords->count(),
            'medical_history' => $medicalRecords
        ]);
    }
}
