<?php

namespace App\Http\Controllers;

use App\Models\BillingInvoice;
use App\Models\PharmacyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    /**
     * Get all pending billing invoices (for accountant)
     */
    public function getPendingInvoices()
    {
        $invoices = BillingInvoice::with([
            'patient:id,name,phone,dob,gender,address',
            'doctor:id,name',
            'appointment:id,appointment_datetime,reason',
            'prescription.prescriptionItems.medicine:id,name,price,unit'
        ])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($invoices);
    }

    /**
     * Get billing invoice details by ID
     */
    public function getInvoiceDetails($id)
    {
        $invoice = BillingInvoice::with([
            'patient:id,name,phone,dob,gender,address',
            'doctor:id,name',
            'appointment:id,appointment_datetime,reason',
            'medicalRecord:id,diagnosis,doctor_notes',
            'prescription.prescriptionItems.medicine:id,name,price,unit',
            'processedBy:id,name'
        ])->findOrFail($id);

        return response()->json($invoice);
    }

    /**
     * Process payment for an invoice
     */
    public function processPayment(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,bank_transfer,credit_card',
            'amount_paid' => 'required|numeric|min:0',
        ]);

        $invoice = BillingInvoice::findOrFail($id);

        if ($invoice->status !== 'pending') {
            return response()->json([
                'message' => 'This invoice has already been processed.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Mark invoice as paid
            $invoice->markAsPaid(
                auth()->id(),
                $request->payment_method,
                $request->amount_paid
            );

            // Create pharmacy transaction to authorize medicine dispensing
            if ($invoice->prescription_id) {
                PharmacyTransaction::create([
                    'prescription_id' => $invoice->prescription_id,
                    'patient_id' => $invoice->patient_id,
                    'pharmacist_id' => null, // Will be set when pharmacist dispenses
                    'total_amount' => $invoice->medication_cost,
                    'payment_method' => $request->payment_method,
                    'status' => 'paid_pending_dispensing',
                    'transaction_date' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Payment processed successfully.',
                'invoice' => $invoice->fresh(['patient', 'doctor', 'processedBy'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to process payment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a billing invoice
     */
    public function cancelInvoice($id)
    {
        $invoice = BillingInvoice::findOrFail($id);

        if ($invoice->status === 'paid') {
            return response()->json([
                'message' => 'Cannot cancel a paid invoice.'
            ], 400);
        }

        $invoice->update(['status' => 'cancelled']);

        // Cancel all medicine reservations associated with this invoice
        if ($invoice->prescription_id) {
            $invoice->prescription->medicineReservations()
                ->where('status', 'reserved')
                ->each(function ($reservation) {
                    $reservation->cancelReservation();
                });
        }

        return response()->json([
            'message' => 'Invoice cancelled successfully.'
        ]);
    }

    /**
     * Get payment history (all invoices)
     */
    public function getPaymentHistory(Request $request)
    {
        $query = BillingInvoice::with([
            'patient:id,name,phone',
            'doctor:id,name',
            'processedBy:id,name'
        ]);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search by patient name or phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($invoices);
    }

    /**
     * Get billing statistics
     */
    public function getStatistics(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $stats = [
            'total_invoices' => BillingInvoice::whereBetween('created_at', [$startDate, $endDate])->count(),
            'pending_invoices' => BillingInvoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'pending')->count(),
            'paid_invoices' => BillingInvoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')->count(),
            'total_revenue' => BillingInvoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')->sum('total_amount'),
            'consultation_revenue' => BillingInvoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')->sum('consultation_fee'),
            'medication_revenue' => BillingInvoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')->sum('medication_cost'),
            'lab_test_revenue' => BillingInvoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')->sum('lab_test_cost'),
        ];

        return response()->json($stats);
    }
}
