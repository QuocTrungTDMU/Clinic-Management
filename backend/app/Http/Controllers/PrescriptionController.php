<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    /**
     * Display a listing of prescriptions
     */
    public function index(Request $request)
    {
        $patientId = $request->query('patient_id');
        $doctorId = $request->query('doctor_id');

        $query = Prescription::with(['patient', 'doctor', 'medicalRecord', 'items'])
            ->orderBy('created_at', 'desc');

        if ($patientId) {
            $query->where('patient_id', $patientId);
        }

        if ($doctorId) {
            $query->where('doctor_id', $doctorId);
        }

        $prescriptions = $query->paginate(10);

        return response()->json($prescriptions);
    }

    /**
     * Store a newly created prescription
     */
    public function store(Request $request)
    {
        $request->validate([
            'medical_record_id' => 'required|exists:medical_records,id',
            'patient_id' => 'required|exists:patients,id',
            'general_instructions' => 'nullable|string',
            'precautions' => 'nullable|string',
            'diet_advice' => 'nullable|string',
            'lifestyle_advice' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.medicine_name' => 'required|string',
            'items.*.strength' => 'nullable|string',
            'items.*.dosage' => 'required|string',
            'items.*.frequency' => 'required|string',
            'items.*.duration' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.instructions' => 'nullable|string',
            'items.*.morning' => 'nullable|boolean',
            'items.*.afternoon' => 'nullable|boolean',
            'items.*.evening' => 'nullable|boolean',
            'items.*.before_meal' => 'nullable|boolean',
            'items.*.after_meal' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            // Create prescription
            $prescription = Prescription::create([
                'medical_record_id' => $request->medical_record_id,
                'patient_id' => $request->patient_id,
                'doctor_id' => Auth::id(),
                'general_instructions' => $request->general_instructions,
                'precautions' => $request->precautions,
                'diet_advice' => $request->diet_advice,
                'lifestyle_advice' => $request->lifestyle_advice,
            ]);

            // Create prescription items
            $totalCost = 0;

            foreach ($request->items as $item) {
                $unitPrice = $item['unit_price'] ?? 0;
                $quantity = $item['quantity'];
                $totalPrice = $unitPrice * $quantity;
                $totalCost += $totalPrice;

                PrescriptionItem::create([
                    'prescription_id' => $prescription->id,
                    'medicine_name' => $item['medicine_name'],
                    'medicine_type' => $item['medicine_type'] ?? null,
                    'strength' => $item['strength'],
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

            DB::commit();

            // Load relationships for response
            $prescription->load(['patient', 'doctor', 'medicalRecord', 'items']);

            return response()->json([
                'message' => 'Prescription created successfully',
                'data' => $prescription
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified prescription
     */
    public function show(Prescription $prescription)
    {
        $prescription->load(['patient', 'doctor', 'medicalRecord', 'items']);

        return response()->json($prescription);
    }

    /**
     * Update the specified prescription
     */
    public function update(Request $request, Prescription $prescription)
    {
        $request->validate([
            'general_instructions' => 'nullable|string',
            'precautions' => 'nullable|string',
            'diet_advice' => 'nullable|string',
            'lifestyle_advice' => 'nullable|string',
        ]);

        $prescription->update($request->only([
            'general_instructions',
            'precautions',
            'diet_advice',
            'lifestyle_advice',
        ]));

        $prescription->load(['patient', 'doctor', 'medicalRecord', 'items']);

        return response()->json([
            'message' => 'Prescription updated successfully',
            'data' => $prescription
        ]);
    }

    /**
     * Remove the specified prescription
     */
    public function destroy(Prescription $prescription)
    {
        // Delete related prescription items first
        $prescription->items()->delete();

        // Delete the prescription
        $prescription->delete();

        return response()->json([
            'message' => 'Prescription deleted successfully'
        ]);
    }

    /**
     * Mark prescription as printed
     */
    public function markAsPrinted(Prescription $prescription)
    {
        $prescription->update([
            'is_printed' => true,
            'printed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Prescription marked as printed',
            'data' => $prescription
        ]);
    }

    /**
     * Get prescription for printing (formatted data)
     */
    public function getPrintData(Prescription $prescription)
    {
        $prescription->load(['patient', 'doctor', 'medicalRecord', 'items']);

        $printData = [
            'prescription' => $prescription,
            'clinic_info' => [
                'name' => config('app.clinic_name', 'Clinic Management System'),
                'address' => config('app.clinic_address', ''),
                'phone' => config('app.clinic_phone', ''),
                'email' => config('app.clinic_email', ''),
            ],
            'print_date' => now()->format('d/m/Y H:i:s'),
        ];

        return response()->json($printData);
    }
}
