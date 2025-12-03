<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use App\Models\PharmacyTransaction;
use App\Models\Medicine;
use App\Models\BillingInvoice;
use App\Models\MedicineReservation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PharmacyController extends Controller
{
    /**
     * Get pending prescriptions (waiting to be dispensed)
     * Only show prescriptions with paid invoices
     */
    public function getPendingPrescriptions(Request $request): JsonResponse
    {
        // Get prescriptions that have paid billing invoices and pending medicine reservations
        $query = Prescription::with(['patient', 'doctor', 'medicalRecord', 'items', 'billingInvoice'])
            ->where('status', 'pending')
            ->whereHas('billingInvoice', function ($q) {
                $q->where('status', 'paid');
            })
            ->whereHas('medicineReservations', function ($q) {
                $q->where('status', 'reserved');
            })
            ->orderBy('created_at', 'desc');

        // Filter by date if provided
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Filter by patient name/phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $prescriptions = $query->paginate(20);

        return response()->json($prescriptions);
    }

    /**
     * Get prescription details for dispensing
     */
    public function getPrescriptionForDispensing($id): JsonResponse
    {
        $prescription = Prescription::with([
            'patient',
            'doctor',
            'medicalRecord',
            'items',
        ])->findOrFail($id);

        // Check if prescription is already dispensed
        if ($prescription->status === 'dispensed') {
            return response()->json([
                'message' => 'Đơn thuốc này đã được bán'
            ], 400);
        }

        // Check medicine stock availability
        $items = $prescription->items->map(function ($item) {
            // Try to find medicine in inventory
            $medicine = Medicine::where('name', $item->medicine_name)
                ->where('status', 'active')
                ->first();

            return [
                'id' => $item->id,
                'medicine_name' => $item->medicine_name,
                'medicine_type' => $item->medicine_type,
                'strength' => $item->strength,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_price' => $item->total_price,
                'dosage' => $item->dosage,
                'frequency' => $item->frequency,
                'duration' => $item->duration,
                'instructions' => $item->instructions,
                'in_stock' => $medicine ? $medicine->stock_quantity : 0,
                'available' => $medicine ? ($medicine->stock_quantity >= $item->quantity) : false,
                'medicine_id' => $medicine?->id,
            ];
        });

        return response()->json([
            'prescription' => $prescription,
            'items' => $items,
            'total_amount' => $prescription->total_cost,
            'patient' => $prescription->patient,
            'doctor' => $prescription->doctor,
        ]);
    }

    /**
     * Dispense prescription (sell medicine and create transaction)
     * Updated to use medicine reservations and verify payment
     */
    public function dispensePrescription(Request $request, $id): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string',
        ]);

        $prescription = Prescription::with(['items', 'billingInvoice', 'medicineReservations'])
            ->findOrFail($id);

        // Check if already dispensed
        if ($prescription->status === 'dispensed') {
            return response()->json([
                'message' => 'Đơn thuốc này đã được bán'
            ], 400);
        }

        // Verify that billing invoice is paid
        if (!$prescription->billingInvoice || $prescription->billingInvoice->status !== 'paid') {
            return response()->json([
                'message' => 'Hóa đơn chưa được thanh toán. Vui lòng yêu cầu bệnh nhân thanh toán tại phòng kế toán trước.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Mark all medicine reservations as dispensed (this will deduct real stock)
            $reservations = $prescription->medicineReservations()
                ->where('status', 'reserved')
                ->get();

            if ($reservations->isEmpty()) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Không tìm thấy thuốc đã được đặt trước cho đơn này.'
                ], 400);
            }

            foreach ($reservations as $reservation) {
                // This method will deduct real stock and update status
                $reservation->markAsDispensed(Auth::id());
            }

            // Update pharmacy transaction status (created by accountant)
            $pharmacyTransaction = PharmacyTransaction::where('prescription_id', $prescription->id)
                ->where('status', 'paid_pending_dispensing')
                ->first();

            if ($pharmacyTransaction) {
                $pharmacyTransaction->update([
                    'pharmacist_id' => Auth::id(),
                    'status' => 'completed',
                    'notes' => $request->notes,
                ]);
            } else {
                // Fallback: create transaction if not exists (shouldn't happen in normal flow)
                $pharmacyTransaction = PharmacyTransaction::create([
                    'prescription_id' => $prescription->id,
                    'patient_id' => $prescription->patient_id,
                    'pharmacist_id' => Auth::id(),
                    'total_amount' => $prescription->total_cost,
                    'payment_method' => $prescription->billingInvoice->payment_method,
                    'payment_status' => 'paid',
                    'status' => 'completed',
                    'transaction_date' => now(),
                    'notes' => $request->notes,
                ]);
            }

            // Update prescription status
            $prescription->update([
                'status' => 'dispensed',
                'dispensed_by' => Auth::id(),
                'dispensed_at' => now(),
            ]);

            DB::commit();

            // Load relationships for response
            $pharmacyTransaction->load(['prescription.items', 'patient', 'pharmacist']);

            return response()->json([
                'message' => 'Phát thuốc thành công',
                'transaction' => $pharmacyTransaction
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Có lỗi xảy ra khi phát thuốc',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pharmacy transactions (sales history)
     */
    public function getTransactions(Request $request): JsonResponse
    {
        $query = PharmacyTransaction::with([
            'prescription.items',
            'patient',
            'pharmacist'
        ])->orderBy('transaction_date', 'desc');

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('transaction_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('transaction_date', '<=', $request->to_date);
        }

        // Filter by payment method
        if ($request->has('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by pharmacist
        if ($request->has('pharmacist_id')) {
            $query->where('pharmacist_id', $request->pharmacist_id);
        }

        $transactions = $query->get();

        // Transform data to match frontend expectations
        $transformedData = $transactions->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'prescription_id' => $transaction->prescription_id,
                'patient_name' => $transaction->patient->name ?? 'N/A',
                'patient_phone' => $transaction->patient->phone ?? 'N/A',
                'total_amount' => $transaction->total_amount,
                'payment_method' => $transaction->payment_method,
                'paid_amount' => $transaction->paid_amount ?? $transaction->total_amount,
                'change_amount' => $transaction->change_amount ?? 0,
                'dispensed_by' => $transaction->pharmacist->name ?? 'N/A',
                'dispensed_at' => $transaction->transaction_date,
                'items' => $transaction->prescription->items->map(function ($item) {
                    return [
                        'medicine_name' => $item->medicine_name,
                        'quantity' => $item->quantity_dispensed ?? $item->quantity,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $item->total_price,
                    ];
                }) ?? [],
            ];
        });

        return response()->json([
            'data' => $transformedData
        ]);
    }

    /**
     * Get today's pharmacy statistics
     */
    public function getTodayStats(): JsonResponse
    {
        $today = now()->toDateString();

        $stats = [
            'pending_prescriptions' => Prescription::where('status', 'pending')
                ->whereDate('created_at', $today)
                ->count(),
            'dispensed_today' => PharmacyTransaction::whereDate('transaction_date', $today)
                ->count(),
            'revenue_today' => PharmacyTransaction::whereDate('transaction_date', $today)
                ->sum('total_amount'),
            'low_stock_medicines' => Medicine::where('status', 'active')
                ->whereColumn('stock_quantity', '<=', 'min_stock_alert')
                ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get transaction receipt for printing
     */
    public function getReceipt($id): JsonResponse
    {
        $transaction = PharmacyTransaction::with([
            'prescription.items',
            'patient',
            'pharmacist',
            'prescription.doctor'
        ])->findOrFail($id);

        $receiptData = [
            'transaction' => $transaction,
            'clinic_info' => [
                'name' => config('app.clinic_name', 'Clinic Management System'),
                'address' => config('app.clinic_address', ''),
                'phone' => config('app.clinic_phone', ''),
                'email' => config('app.clinic_email', ''),
            ],
            'print_date' => now()->format('d/m/Y H:i:s'),
        ];

        return response()->json($receiptData);
    }
}
