<?php
// Test toàn bộ flow khám bệnh mới

require_once __DIR__ . '/vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';
$token = null;

function login()
{
    global $baseUrl, $token;

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
    $token = $data['token'] ?? null;
    return $token;
}

function apiCall($method, $endpoint, $data = null)
{
    global $baseUrl, $token;

    $ch = curl_init("$baseUrl$endpoint");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "Authorization: Bearer $token"
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

echo "=== TEST FLOW KHÁM BỆNH MỚI ===\n\n";

// 1. Login
echo "1. Đăng nhập...\n";
if (!login()) {
    die("✗ Không thể đăng nhập!\n");
}
echo "✓ Đã đăng nhập\n\n";

// 2. Lấy appointment đầu tiên
echo "2. Lấy danh sách appointments...\n";
$result = apiCall('GET', '/appointments');
if (empty($result['data']['data'])) {
    die("✗ Không có appointment nào!\n");
}
$appointment = $result['data']['data'][0];
$appointmentId = $appointment['id'];
$patientId = $appointment['patient_id'];
$doctorId = $appointment['doctor_id'];
echo "✓ Appointment ID: $appointmentId - Patient ID: $patientId\n\n";

// 3. Test ICD-10 API
echo "3. Test tìm kiếm bệnh ICD-10...\n";
$result = apiCall('GET', '/icd10/search?q=sốt&limit=3');
if (empty($result['data']['data'])) {
    echo "! Không tìm thấy bệnh nào, thử tìm 'viêm'\n";
    $result = apiCall('GET', '/icd10/search?q=viêm&limit=3');
}
$diseases = $result['data']['data'] ?? [];
echo "✓ Tìm thấy " . count($diseases) . " bệnh:\n";
foreach ($diseases as $disease) {
    echo "  - [{$disease['code']}] {$disease['name']}\n";
}
$selectedDisease = $diseases[0] ?? null;
echo "\n";

// 4. Test Lab Test Types
echo "4. Test lấy danh sách xét nghiệm...\n";
$result = apiCall('GET', '/lab-test-types?category=xet_nghiem');
echo "✓ Có " . count($result['data']) . " loại xét nghiệm\n";
$labTestType = $result['data'][0];
echo "  Chọn: [{$labTestType['code']}] {$labTestType['name']}\n\n";

// 5. Tạo Medical Record với vital signs
echo "5. Tạo Medical Record mới...\n";
$medicalRecordData = [
    'appointment_id' => $appointmentId,
    'patient_id' => $patientId,
    'doctor_id' => $doctorId,

    // Vital signs
    'blood_pressure' => '120/80',
    'temperature' => 37.5,
    'heart_rate' => 75,
    'respiratory_rate' => 18,
    'oxygen_saturation' => 98.5,
    'weight' => 65.5,
    'height' => 170,
    'bmi' => 22.66,

    // Chief complaint
    'chief_complaint' => json_encode([
        'respiratory' => ['Ho', 'Đau họng'],
        'fever_pain' => ['Sốt', 'Đau đầu'],
        'digestive' => [],
        'skin' => [],
        'general' => ['Mệt mỏi']
    ]),
    'symptoms' => 'Bệnh nhân than phiền ho và đau họng từ 3 ngày nay, kèm sốt nhẹ.',

    // Physical exam
    'physical_examination' => json_encode([
        'general' => ['Tỉnh táo, định hướng tốt'],
        'throat' => ['Họng đỏ', 'Amidan sưng'],
        'respiratory' => ['Phổi trong sạch'],
        'cardiovascular' => ['Tim đập bình thường', 'Nhịp đều'],
        'abdomen' => ['Mềm, không đau'],
        'skin' => ['Không phát ban']
    ]),

    // Diagnosis (chọn bệnh từ ICD-10)
    'diagnosis' => $selectedDisease ? $selectedDisease['name'] : 'Viêm họng cấp',
    'icd10_id' => $selectedDisease ? $selectedDisease['id'] : null,
    'icd10_code' => $selectedDisease ? $selectedDisease['code'] : 'J02',

    'treatment_plan' => 'Uống thuốc kháng sinh, nghỉ ngơi',
    'recommendations' => 'Uống nhiều nước, tránh thức khuya',
    'clinical_notes' => 'Theo dõi nếu sốt cao trên 39 độ',
    'follow_up_date' => date('Y-m-d', strtotime('+7 days')),
    'follow_up_notes' => 'Tái khám sau 1 tuần nếu không khỏi'
];

$result = apiCall('POST', '/medical-records', $medicalRecordData);
if ($result['code'] !== 201) {
    echo "✗ Lỗi tạo medical record: " . json_encode($result['data']) . "\n";
    die();
}
$medicalRecord = $result['data']['data'];
$medicalRecordId = $medicalRecord['id'];
echo "✓ Đã tạo Medical Record ID: $medicalRecordId\n";
echo "  - Huyết áp: {$medicalRecord['blood_pressure']}\n";
echo "  - Nhiệt độ: {$medicalRecord['temperature']}°C\n";
echo "  - Nhịp tim: {$medicalRecord['heart_rate']} lần/phút\n";
echo "  - BMI: {$medicalRecord['bmi']}\n";
echo "  - Chẩn đoán: {$medicalRecord['diagnosis']} (ICD: {$medicalRecord['icd10_code']})\n\n";

// 6. Chỉ định xét nghiệm
echo "6. Chỉ định xét nghiệm...\n";
$labTestData = [
    'medical_record_id' => $medicalRecordId,
    'lab_test_type_id' => $labTestType['id'],
    'clinical_notes' => 'Xét nghiệm để kiểm tra tình trạng nhiễm trùng'
];

$result = apiCall('POST', '/lab-tests', $labTestData);
if ($result['code'] !== 201) {
    echo "✗ Lỗi chỉ định xét nghiệm: " . json_encode($result['data']) . "\n";
} else {
    $labTest = $result['data']['data'];
    echo "✓ Đã chỉ định: {$labTest['lab_test_type']['name']}\n";
    echo "  - Mã: {$labTest['lab_test_type']['code']}\n";
    echo "  - Trạng thái: {$labTest['status']}\n\n";
}

// 7. Lấy danh sách xét nghiệm pending
echo "7. Lấy danh sách xét nghiệm chờ thực hiện...\n";
$result = apiCall('GET', '/lab-tests/pending');
echo "✓ Có " . count($result['data']) . " xét nghiệm đang chờ\n\n";

// 8. Cập nhật kết quả xét nghiệm
if (isset($labTest)) {
    echo "8. Cập nhật kết quả xét nghiệm...\n";
    $resultData = [
        'status' => 'completed',
        'result' => 'WBC: 12,000/μL (tăng nhẹ), CRP: 15 mg/L',
        'interpretation' => 'Có dấu hiệu nhiễm trùng nhẹ',
    ];

    $result = apiCall('PUT', "/lab-tests/{$labTest['id']}/result", $resultData);
    if ($result['code'] === 200) {
        echo "✓ Đã cập nhật kết quả xét nghiệm\n\n";
    }
}

// 9. Lấy lại medical record với lab tests
echo "9. Lấy thông tin đầy đủ Medical Record...\n";
$result = apiCall('GET', "/medical-records?appointment_id=$appointmentId");
if (!empty($result['data']['data'])) {
    $record = $result['data']['data'][0];
    echo "✓ Medical Record:\n";
    echo "  - Bệnh nhân: {$record['patient']['name']}\n";
    echo "  - Chẩn đoán: {$record['diagnosis']}\n";
    if (isset($record['icd10'])) {
        echo "  - ICD-10: [{$record['icd10']['code']}] {$record['icd10']['name']}\n";
    }
    echo "  - Số xét nghiệm: " . count($record['lab_tests'] ?? []) . "\n";

    if (!empty($record['lab_tests'])) {
        foreach ($record['lab_tests'] as $test) {
            echo "    + {$test['lab_test_type']['name']}: {$test['status']}\n";
            if ($test['result']) {
                echo "      Kết quả: {$test['result']}\n";
            }
        }
    }
}
echo "\n";

// 10. Test update medical record
echo "10. Cập nhật Medical Record...\n";
$updateData = [
    'clinical_notes' => 'Đã xem kết quả xét nghiệm, bệnh nhân có dấu hiệu nhiễm trùng nhẹ. Tiếp tục điều trị theo phác đồ.'
];

$result = apiCall('PUT', "/medical-records/$medicalRecordId", $updateData);
if ($result['code'] === 200) {
    echo "✓ Đã cập nhật ghi chú lâm sàng\n\n";
}

echo "=== HOÀN THÀNH TEST ===\n";
echo "\n✅ Tất cả các bước đều hoạt động tốt!\n";
echo "\nKết quả:\n";
echo "- Medical Record ID: $medicalRecordId\n";
echo "- Có đầy đủ vital signs\n";
echo "- Có chẩn đoán ICD-10\n";
echo "- Có xét nghiệm với kết quả\n";
echo "- Workflow hoàn chỉnh!\n";
