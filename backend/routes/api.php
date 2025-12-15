<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\PharmacyController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\Api\ICD10Controller;
use App\Http\Controllers\Api\LabTestTypeController;
use App\Http\Controllers\Api\LabTestController;
use App\Http\Controllers\BillingController;

// Simple API Login route
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('patients', PatientController::class);

    // Appointment custom routes (must be before apiResource)
    Route::get('/appointments/history', [AppointmentController::class, 'getHistory']);
    Route::get('/appointments-today', [AppointmentController::class, 'getTodayAppointments']);
    Route::get('/doctor-availability', [AppointmentController::class, 'getDoctorAvailability']);
    Route::get('/available-slots', [AppointmentController::class, 'getAvailableSlotsBySpecialty']);

    // Appointment CRUD routes
    Route::apiResource('appointments', AppointmentController::class);

    // Patient History routes
    Route::get('/patients/{patientId}/history', [AppointmentController::class, 'getPatientHistory']);

    // Queue Management routes
    Route::get('/queue/today', [QueueController::class, 'getTodayQueue']);
    Route::post('/queue/checkin/{appointmentId}', [QueueController::class, 'checkIn']);
    Route::put('/queue/status/{appointmentId}', [QueueController::class, 'updateStatus']);
    Route::get('/queue/stats', [QueueController::class, 'getQueueStats']);
    Route::get('/queue/waiting', [QueueController::class, 'getWaitingQueue']);

    // Doctor Queue - get patients in examination queue
    Route::get('/doctor/queue', [QueueController::class, 'getDoctorQueue']);

    // Medical Records routes
    Route::apiResource('medical-records', MedicalRecordController::class);
    Route::get('/patients/{patientId}/medical-records', [MedicalRecordController::class, 'getPatientMedicalHistory']);

    // Prescription routes
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::put('/prescriptions/{prescription}/print', [PrescriptionController::class, 'markAsPrinted']);
    Route::get('/prescriptions/{prescription}/print-data', [PrescriptionController::class, 'getPrintData']);

    // Medicine routes
    Route::get('/medicines/search', [MedicineController::class, 'search']); // For autocomplete in prescription
    Route::get('/medicines/low-stock', [MedicineController::class, 'lowStock']);
    Route::get('/medicines/categories', [MedicineController::class, 'categories']);
    Route::post('/medicines/{id}/stock', [MedicineController::class, 'updateStock']);
    Route::apiResource('medicines', MedicineController::class);

    // Pharmacy routes
    Route::get('/pharmacy/pending-prescriptions', [PharmacyController::class, 'getPendingPrescriptions']);
    Route::get('/pharmacy/prescriptions/{id}', [PharmacyController::class, 'getPrescriptionForDispensing']);
    Route::post('/pharmacy/dispense/{id}', [PharmacyController::class, 'dispensePrescription']);
    Route::get('/pharmacy/transactions', [PharmacyController::class, 'getTransactions']);
    Route::get('/pharmacy/stats/today', [PharmacyController::class, 'getTodayStats']);
    Route::get('/pharmacy/receipt/{id}', [PharmacyController::class, 'getReceipt']);

    // Admin - Doctor Management routes
    Route::get('/admin/doctors', [DoctorController::class, 'index']);
    Route::get('/admin/doctors/stats', [DoctorController::class, 'stats']);
    Route::post('/admin/doctors', [DoctorController::class, 'store']);
    Route::put('/admin/doctors/{id}', [DoctorController::class, 'update']);
    Route::delete('/admin/doctors/{id}', [DoctorController::class, 'destroy']);
    Route::post('/admin/doctors/{id}/approve', [DoctorController::class, 'approve']);
    Route::post('/admin/doctors/{id}/reject', [DoctorController::class, 'reject']);
    Route::post('/admin/doctors/{id}/toggle-status', [DoctorController::class, 'toggleStatus']);

    // ICD-10 routes (Chẩn đoán bệnh)
    Route::get('/icd10/search', [ICD10Controller::class, 'search']);
    Route::get('/icd10/categories', [ICD10Controller::class, 'categories']);
    Route::get('/icd10/specialty/{specialty}', [ICD10Controller::class, 'commonBySpecialty']);
    Route::get('/icd10/code/{code}', [ICD10Controller::class, 'getByCode']);
    Route::get('/icd10/{id}', [ICD10Controller::class, 'show']);

    // Lab Test Type routes (Loại xét nghiệm)
    Route::get('/lab-test-types', [LabTestTypeController::class, 'index']);
    Route::get('/lab-test-types/categories', [LabTestTypeController::class, 'categories']);
    Route::get('/lab-test-types/category/{category}', [LabTestTypeController::class, 'byCategory']);
    Route::get('/lab-test-types/{id}', [LabTestTypeController::class, 'show']);

    // Lab Test routes (Chỉ định và kết quả xét nghiệm)
    Route::post('/lab-tests', [LabTestController::class, 'store']); // Bác sĩ chỉ định
    Route::get('/lab-tests/pending', [LabTestController::class, 'pending']); // Danh sách chờ thực hiện
    Route::get('/lab-tests/appointment/{appointmentId}', [LabTestController::class, 'getByAppointment']); // Lấy theo appointment
    Route::get('/lab-tests/medical-record/{medicalRecordId}', [LabTestController::class, 'getByMedicalRecord']);
    Route::put('/lab-tests/{id}/status', [LabTestController::class, 'updateStatus']); // Cập nhật trạng thái
    Route::put('/lab-tests/{id}/result', [LabTestController::class, 'updateResult']); // Nhập kết quả
    Route::get('/lab-tests/{id}', [LabTestController::class, 'show']);
    Route::delete('/lab-tests/{id}', [LabTestController::class, 'destroy']); // Hủy

    // Billing routes (Accountant - Kế toán thu tiền)
    Route::get('/billing/pending-invoices', [BillingController::class, 'getPendingInvoices']); // Danh sách hóa đơn chờ thanh toán
    Route::get('/billing/invoices/{id}', [BillingController::class, 'getInvoiceDetails']); // Chi tiết hóa đơn
    Route::post('/billing/invoices/{id}/process-payment', [BillingController::class, 'processPayment']); // Thu tiền
    Route::post('/billing/invoices/{id}/cancel', [BillingController::class, 'cancelInvoice']); // Hủy hóa đơn
    Route::get('/billing/payment-history', [BillingController::class, 'getPaymentHistory']); // Lịch sử thanh toán
    Route::get('/billing/statistics', [BillingController::class, 'getStatistics']); // Thống kê doanh thu
    Route::get('/billing/receipt/{id}', [BillingController::class, 'getReceipt']); // In hóa đơn
    Route::get('/billing/admin-revenue', [BillingController::class, 'getAdminRevenue']); // Tổng hợp doanh thu cho Admin

    // VNPay routes
    Route::post('/vnpay/create-payment/{invoiceId}', [App\Http\Controllers\VNPayController::class, 'createPayment']); // Tạo URL thanh toán VNPay
    Route::get('/vnpay/return', [App\Http\Controllers\VNPayController::class, 'vnpayReturn']); // VNPay callback

    // Helper routes for forms
    Route::get('/doctors', function () {
        return response()->json(
            \App\Models\User::whereHas('roles', function ($query) {
                $query->where('name', 'doctor');
            })->select('id', 'name', 'email')->get()
        );
    });

    Route::get('/patients-list', function () {
        return response()->json(
            \App\Models\Patient::select('id', 'name', 'phone', 'dob')->orderBy('name')->get()
        );
    });
});
