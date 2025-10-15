<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\PrescriptionController;

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

    // Prescription routes
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::put('/prescriptions/{prescription}/print', [PrescriptionController::class, 'markAsPrinted']);
    Route::get('/prescriptions/{prescription}/print-data', [PrescriptionController::class, 'getPrintData']);

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
