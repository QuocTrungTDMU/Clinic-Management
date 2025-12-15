<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VNPay Configuration Test ===\n\n";

echo "TMN Code: " . env('VNPAY_TMN_CODE') . "\n";
echo "Hash Secret: " . env('VNPAY_HASH_SECRET') . "\n";
echo "VNPay URL: " . env('VNPAY_URL') . "\n\n";

// Test creating a payment URL
$invoice = App\Models\BillingInvoice::first();
if (!$invoice) {
    echo "No invoice found to test\n";
    exit;
}

echo "Test Invoice ID: " . $invoice->id . "\n";
echo "Amount: " . $invoice->total_amount . "\n\n";

$vnp_TmnCode = env('VNPAY_TMN_CODE');
$vnp_HashSecret = env('VNPAY_HASH_SECRET');
$vnp_Url = env('VNPAY_URL');

$vnp_TxnRef = 'TEST_INV' . $invoice->id . '_' . time();
$vnp_OrderInfo = 'Test thanh toan hoa don #' . $invoice->id;
$vnp_Amount = $invoice->total_amount * 100;
$vnp_ReturnUrl = 'http://localhost:5173/accountant/vnpay-return';

$inputData = array(
    "vnp_Version" => "2.1.0",
    "vnp_TmnCode" => $vnp_TmnCode,
    "vnp_Amount" => $vnp_Amount,
    "vnp_Command" => "pay",
    "vnp_CreateDate" => date('YmdHis'),
    "vnp_CurrCode" => "VND",
    "vnp_IpAddr" => '127.0.0.1',
    "vnp_Locale" => 'vn',
    "vnp_OrderInfo" => $vnp_OrderInfo,
    "vnp_OrderType" => 'billpayment',
    "vnp_ReturnUrl" => $vnp_ReturnUrl,
    "vnp_TxnRef" => $vnp_TxnRef,
);

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
$vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
$vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;

echo "=== Generated Payment URL ===\n";
echo $vnp_Url . "\n\n";

echo "=== Payment Parameters ===\n";
foreach ($inputData as $key => $value) {
    echo "$key: $value\n";
}
echo "\nvnp_SecureHash: $vnpSecureHash\n";
