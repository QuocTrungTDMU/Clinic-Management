<?php
// Test API ICD-10 và Lab Tests

require_once __DIR__ . '/vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';

// Login để lấy token
function getAuthToken()
{
    global $baseUrl;

    $ch = curl_init("$baseUrl/login");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => 'admin@clinic.local',
        'password' => 'admin123'
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);
    return $data['token'] ?? null;
}

function testAPI($endpoint, $token, $method = 'GET', $data = null)
{
    global $baseUrl;

    $ch = curl_init("$baseUrl$endpoint");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "Authorization: Bearer $token"
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

echo "=== TEST API ICD-10 VÀ LAB TESTS ===\n\n";

// 1. Login
echo "1. Đăng nhập...\n";
$token = getAuthToken();
if (!$token) {
    die("Không thể đăng nhập!\n");
}
echo "✓ Đã đăng nhập thành công\n\n";

// 2. Test search ICD-10
echo "2. Tìm kiếm bệnh 'viêm'...\n";
$result = testAPI('/icd10/search?q=viêm&limit=5', $token);
echo "Tìm thấy " . count($result['data'] ?? []) . " bệnh:\n";
foreach (($result['data'] ?? []) as $disease) {
    echo "  - [{$disease['code']}] {$disease['name']} ({$disease['specialty']})\n";
}
echo "\n";

// 3. Test lấy bệnh phổ biến theo chuyên khoa
echo "3. Lấy bệnh phổ biến chuyên khoa Nội...\n";
$result = testAPI('/icd10/specialty/internal', $token);
echo "Tìm thấy " . count($result ?? []) . " bệnh:\n";
foreach (array_slice($result ?? [], 0, 5) as $disease) {
    echo "  - [{$disease['code']}] {$disease['name']}\n";
}
echo "\n";

// 4. Test lấy danh sách loại xét nghiệm
echo "4. Lấy danh sách xét nghiệm máu...\n";
$result = testAPI('/lab-test-types?category=xet_nghiem', $token);
echo "Tìm thấy " . count($result ?? []) . " loại xét nghiệm:\n";
foreach (array_slice($result ?? [], 0, 5) as $test) {
    echo "  - [{$test['code']}] {$test['name']} - " . number_format($test['price']) . "đ\n";
}
echo "\n";

// 5. Test lấy loại chẩn đoán hình ảnh
echo "5. Lấy danh sách chẩn đoán hình ảnh...\n";
$result = testAPI('/lab-test-types/category/chuan_doan_hinh_anh', $token);
echo "Tìm thấy " . count($result ?? []) . " loại:\n";
foreach ($result ?? [] as $test) {
    echo "  - [{$test['code']}] {$test['name']} - " . number_format($test['price']) . "đ\n";
}
echo "\n";

// 6. Test lấy categories
echo "6. Lấy danh mục ICD-10...\n";
$result = testAPI('/icd10/categories', $token);
echo "Có " . count($result ?? []) . " danh mục:\n";
foreach ($result ?? [] as $category) {
    echo "  - $category\n";
}
echo "\n";

echo "=== TEST HOÀN TẤT ===\n";
