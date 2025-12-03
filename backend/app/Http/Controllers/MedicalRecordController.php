<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Appointment;
use App\Models\BillingInvoice;
use App\Models\MedicineReservation;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MedicalRecordController extends Controller
{
    /**
     * Display a listing of medical records for a patient
     */
    public function index(Request $request)
    {
        $patientId = $request->query('patient_id');
        $appointmentId = $request->query('appointment_id');

        $query = MedicalRecord::with([
            'patient',
            'doctor',
            'appointment',
            'prescriptions.items',
            'icd10',
            'labTests.labTestType'
        ])->orderBy('created_at', 'desc');

        if ($patientId) {
            $query->where('patient_id', $patientId);
        }

        if ($appointmentId) {
            $query->where('appointment_id', $appointmentId);
        }

        $medicalRecords = $query->paginate(10);

        return response()->json($medicalRecords);
    }

    /**
     * Store a newly created medical record
     */
    public function store(Request $request)
    {
        Log::info('Medical Record Request:', $request->all());

        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'patient_id' => 'required|exists:patients,id',
            'chief_complaint' => 'nullable|string',
            'symptoms' => 'nullable|string',
            'physical_examination' => 'nullable|string',
            'vital_signs' => 'nullable|array',

            // Vital signs mới
            'blood_pressure' => 'nullable|string',
            'temperature' => 'nullable|numeric',
            'heart_rate' => 'nullable|integer',
            'respiratory_rate' => 'nullable|integer',
            'oxygen_saturation' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'bmi' => 'nullable|numeric',

            // Diagnosis
            'diagnosis' => 'nullable|string',
            'icd10_id' => 'nullable|exists:icd10_codes,id',
            'icd10_code' => 'nullable|string',

            'treatment_plan' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'clinical_notes' => 'nullable|string',
            'follow_up_date' => 'nullable|date',
            'follow_up_notes' => 'nullable|string',

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
                'doctor_id' => $request->doctor_id ?? Auth::id(),
                'chief_complaint' => $request->chief_complaint,
                'symptoms' => $request->symptoms,
                'physical_examination' => $request->physical_examination,
                'vital_signs' => $request->vital_signs,

                // Vital signs mới
                'blood_pressure' => $request->blood_pressure,
                'temperature' => $request->temperature,
                'heart_rate' => $request->heart_rate,
                'respiratory_rate' => $request->respiratory_rate,
                'oxygen_saturation' => $request->oxygen_saturation,
                'weight' => $request->weight,
                'height' => $request->height,
                'bmi' => $request->bmi,

                // Diagnosis
                'diagnosis' => $request->diagnosis,
                'icd10_id' => $request->icd10_id,
                'icd10_code' => $request->icd10_code,

                'treatment_plan' => $request->treatment_plan,
                'recommendations' => $request->recommendations,
                'clinical_notes' => $request->clinical_notes,
                'follow_up_date' => $request->follow_up_date,
                'follow_up_notes' => $request->follow_up_notes,
            ]);

            // Create prescription if provided
            $prescription = null;
            $medicationCost = 0;

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

                // Create prescription items and medicine reservations
                if (!empty($prescriptionData['items'])) {
                    $totalCost = 0;

                    foreach ($prescriptionData['items'] as $item) {
                        $unitPrice = $item['unit_price'] ?? 0;
                        $quantity = $item['quantity'];
                        $totalPrice = $unitPrice * $quantity;
                        $totalCost += $totalPrice;

                        $prescriptionItem = PrescriptionItem::create([
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

                        // Create medicine reservation (virtual stock deduction)
                        // Find medicine by name if medicine_id not provided
                        $medicineId = $item['medicine_id'] ?? null;
                        if (!$medicineId && isset($item['medicine_name'])) {
                            $medicine = Medicine::where('name', $item['medicine_name'])->first();
                            $medicineId = $medicine?->id;
                        }

                        if ($medicineId) {
                            MedicineReservation::create([
                                'prescription_id' => $prescription->id,
                                'prescription_item_id' => $prescriptionItem->id,
                                'medicine_id' => $medicineId,
                                'medicine_name' => $item['medicine_name'],
                                'reserved_quantity' => $quantity,
                                'unit' => $medicine->unit ?? 'viên',
                                'status' => 'reserved',
                                'reserved_at' => now(),
                                'reserved_by' => Auth::id(),
                            ]);
                        }
                    }

                    // Update prescription total cost
                    $prescription->update(['total_cost' => $totalCost]);
                    $medicationCost = $totalCost;
                }
            }

            // Link lab tests với medical record này (nếu có lab tests cho appointment này)
            $labTests = \App\Models\LabTest::where('appointment_id', $request->appointment_id)
                ->whereNull('medical_record_id')
                ->get();

            $labTestCost = 0;
            if ($labTests->isNotEmpty()) {
                $labTests->each(function ($labTest) use ($medicalRecord) {
                    $labTest->update(['medical_record_id' => $medicalRecord->id]);
                });

                // Calculate lab test costs
                $labTestCost = $labTests->sum(function ($labTest) {
                    return $labTest->labTestType?->price ?? 0;
                });
            }

            // Create billing invoice (consultation fee + medication cost + lab test cost)
            $consultationFee = 100000; // Default consultation fee, can be made configurable

            BillingInvoice::create([
                'appointment_id' => $request->appointment_id,
                'patient_id' => $request->patient_id,
                'doctor_id' => Auth::id(),
                'medical_record_id' => $medicalRecord->id,
                'prescription_id' => $prescription?->id,
                'consultation_fee' => $consultationFee,
                'medication_cost' => $medicationCost,
                'lab_test_cost' => $labTestCost,
                'total_amount' => $consultationFee + $medicationCost + $labTestCost,
                'status' => 'pending',
            ]);

            // Update appointment status to completed
            $appointment = Appointment::find($request->appointment_id);
            if ($appointment) {
                $appointment->update(['status' => 'completed']);
            }

            DB::commit();

            // Load relationships for response
            $medicalRecord->load([
                'patient',
                'doctor',
                'appointment',
                'prescriptions.items',
                'icd10',
                'labTests.labTestType'
            ]);

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
    public function show($id)
    {
        $record = MedicalRecord::with([
            'patient',
            'doctor',
            'appointment',
            'prescriptions.prescriptionItems.medicine',
            'icd10',
            'labTests.labTestType'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $record
        ]);
    }

    /**
     * Update the specified medical record
     */
    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        $request->validate([
            'chief_complaint' => 'nullable|string',
            'symptoms' => 'nullable|string',
            'physical_examination' => 'nullable|string',
            'vital_signs' => 'nullable|array',

            // Vital signs
            'blood_pressure' => 'nullable|string',
            'temperature' => 'nullable|numeric',
            'heart_rate' => 'nullable|integer',
            'respiratory_rate' => 'nullable|integer',
            'oxygen_saturation' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'bmi' => 'nullable|numeric',

            // Diagnosis
            'diagnosis' => 'nullable|string',
            'icd10_id' => 'nullable|exists:icd10_codes,id',
            'icd10_code' => 'nullable|string',

            'treatment_plan' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'clinical_notes' => 'nullable|string',
            'follow_up_date' => 'nullable|date',
            'follow_up_notes' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $medicalRecord->update($request->only([
            'chief_complaint',
            'symptoms',
            'physical_examination',
            'vital_signs',
            'blood_pressure',
            'temperature',
            'heart_rate',
            'respiratory_rate',
            'oxygen_saturation',
            'weight',
            'height',
            'bmi',
            'diagnosis',
            'icd10_id',
            'icd10_code',
            'treatment_plan',
            'recommendations',
            'clinical_notes',
            'follow_up_date',
            'follow_up_notes',
            'notes',
        ]));

        $medicalRecord->load([
            'patient',
            'doctor',
            'appointment',
            'prescriptions.items',
            'icd10',
            'labTests.labTestType'
        ]);

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
        $records = MedicalRecord::where('patient_id', $patientId)
            ->with([
                'doctor',
                'appointment',
                'prescriptions.prescriptionItems.medicine',
                'icd10',
                'labTests.labTestType'
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }
}
