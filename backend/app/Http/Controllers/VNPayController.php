<?php

namespace App\Http\Controllers;

use App\Models\BillingInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VNPayController extends Controller
{
    /**
     * Create VNPay payment URL
     */
    public function createPayment(Request $request, $invoiceId)
    {
        $request->validate([
            'return_url' => 'required|url',
        ]);

        $invoice = BillingInvoice::findOrFail($invoiceId);

        if ($invoice->status !== 'pending') {
            return response()->json([
                'message' => 'Invoice has already been processed.'
            ], 400);
        }

        // VNPay Configuration
        $vnp_TmnCode = env('VNPAY_TMN_CODE', 'DEMO'); // Mã website tại VNPay
        $vnp_HashSecret = env('VNPAY_HASH_SECRET', 'DEMO'); // Chuỗi bí mật
        $vnp_Url = env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');

        $vnp_TxnRef = 'INV' . $invoice->id . '_' . time(); // Mã đơn hàng
        $vnp_OrderInfo = 'Thanh toan hoa don kham benh #' . $invoice->id;
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $invoice->total_amount * 100; // VNPay yêu cầu số tiền x 100
        $vnp_Locale = 'vn';
        $vnp_BankCode = $request->bank_code ?? '';
        $vnp_IpAddr = $request->ip();

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $request->return_url,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        if (!empty($vnp_BankCode)) {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        }

        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $vnp_Url . "?" . $query;
        if (!empty($vnp_HashSecret)) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        // Store transaction reference
        $invoice->update([
            'payment_reference' => $vnp_TxnRef,
            'notes' => 'VNPay payment initiated'
        ]);

        return response()->json([
            'payment_url' => $vnp_Url,
            'txn_ref' => $vnp_TxnRef
        ]);
    }

    /**
     * VNPay IPN/Return Handler
     */
    public function vnpayReturn(Request $request)
    {
        $vnp_HashSecret = env('VNPAY_HASH_SECRET', 'DEMO');

        $inputData = $request->all();
        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';
        unset($inputData['vnp_SecureHash']);
        ksort($inputData);

        $hashData = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        if ($secureHash === $vnp_SecureHash) {
            $vnp_ResponseCode = $request->vnp_ResponseCode;
            $vnp_TxnRef = $request->vnp_TxnRef;
            $vnp_Amount = $request->vnp_Amount / 100;

            // Find invoice by transaction reference
            $invoice = BillingInvoice::where('payment_reference', $vnp_TxnRef)->first();

            if (!$invoice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice not found'
                ], 404);
            }

            if ($vnp_ResponseCode == '00') {
                // Payment successful
                if ($invoice->status === 'pending') {
                    try {
                        \DB::beginTransaction();

                        $invoice->markAsPaid(
                            $invoice->created_by ?? 1,
                            'bank_transfer',
                            $vnp_Amount
                        );

                        // Create pharmacy transaction
                        if ($invoice->prescription_id) {
                            \App\Models\PharmacyTransaction::create([
                                'prescription_id' => $invoice->prescription_id,
                                'patient_id' => $invoice->patient_id,
                                'total_amount' => $invoice->medication_cost,
                                'payment_method' => 'bank_transfer',
                                'status' => 'paid_pending_dispensing',
                                'transaction_date' => now(),
                            ]);
                        }

                        \DB::commit();

                        return response()->json([
                            'success' => true,
                            'message' => 'Payment successful',
                            'invoice_id' => $invoice->id
                        ]);
                    } catch (\Exception $e) {
                        \DB::rollBack();
                        Log::error('VNPay payment processing failed: ' . $e->getMessage());

                        return response()->json([
                            'success' => false,
                            'message' => 'Payment verification successful but processing failed'
                        ], 500);
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Payment already processed',
                    'invoice_id' => $invoice->id
                ]);
            } else {
                // Payment failed
                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed or cancelled',
                    'response_code' => $vnp_ResponseCode
                ]);
            }
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Invalid signature'
            ], 400);
        }
    }
}
