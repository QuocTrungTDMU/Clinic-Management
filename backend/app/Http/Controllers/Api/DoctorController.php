<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class DoctorController extends Controller
{
    /**
     * Get all doctors with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::role('doctor')
            ->with('roles')
            ->withCount(['medicalRecords as patient_count'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $doctors = $query->get()->map(function ($doctor) {
            return [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'email' => $doctor->email,
                'phone' => $doctor->phone ?? 'N/A',
                'specialization' => $doctor->specialization ?? 'General',
                'license' => $doctor->license_number ?? 'N/A',
                'status' => $doctor->status ?? 'active',
                'registered_at' => $doctor->created_at->format('Y-m-d'),
                'approved_at' => $doctor->approved_at?->format('Y-m-d'),
                'patient_count' => $doctor->patient_count ?? 0,
            ];
        });

        return response()->json(['data' => $doctors]);
    }

    /**
     * Approve a pending doctor
     */
    public function approve($id): JsonResponse
    {
        $doctor = User::role('doctor')->findOrFail($id);

        if ($doctor->status === 'active') {
            return response()->json([
                'message' => 'Doctor is already approved'
            ], 400);
        }

        $doctor->update([
            'status' => 'active',
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Doctor approved successfully',
            'data' => $doctor
        ]);
    }

    /**
     * Reject a pending doctor
     */
    public function reject($id): JsonResponse
    {
        $doctor = User::role('doctor')->findOrFail($id);

        if ($doctor->status === 'rejected') {
            return response()->json([
                'message' => 'Doctor is already rejected'
            ], 400);
        }

        $doctor->update([
            'status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Doctor rejected successfully',
            'data' => $doctor
        ]);
    }

    /**
     * Deactivate/Activate a doctor
     */
    public function toggleStatus($id): JsonResponse
    {
        $doctor = User::role('doctor')->findOrFail($id);

        $newStatus = $doctor->status === 'active' ? 'inactive' : 'active';

        $doctor->update(['status' => $newStatus]);

        return response()->json([
            'message' => "Doctor {$newStatus} successfully",
            'data' => $doctor
        ]);
    }

    /**
     * Get doctor statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => User::role('doctor')->count(),
            'active' => User::role('doctor')->where('status', 'active')->count(),
            'pending' => User::role('doctor')->where('status', 'pending')->count(),
            'inactive' => User::role('doctor')->where('status', 'inactive')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Store a new doctor (Admin creates doctor account)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(6)],
            'phone' => ['nullable', 'string', 'max:20'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:255'],
        ]);

        $doctor = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'specialization' => $validated['specialization'] ?? null,
            'license_number' => $validated['license_number'] ?? null,
            'status' => 'active', // Admin-created doctors are auto-approved
            'approved_at' => now(),
        ]);

        // Assign doctor role
        $doctor->assignRole('doctor');

        return response()->json([
            'message' => 'Doctor created successfully',
            'data' => $doctor
        ], 201);
    }

    /**
     * Update doctor information
     */
    public function update(Request $request, $id): JsonResponse
    {
        $doctor = User::role('doctor')->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'unique:users,email,' . $id],
            'password' => ['nullable', Password::min(6)],
            'phone' => ['nullable', 'string', 'max:20'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:255'],
        ]);

        $updateData = [
            'name' => $validated['name'] ?? $doctor->name,
            'email' => $validated['email'] ?? $doctor->email,
            'phone' => $validated['phone'] ?? $doctor->phone,
            'specialization' => $validated['specialization'] ?? $doctor->specialization,
            'license_number' => $validated['license_number'] ?? $doctor->license_number,
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $doctor->update($updateData);

        return response()->json([
            'message' => 'Doctor updated successfully',
            'data' => $doctor
        ]);
    }

    /**
     * Delete a doctor account
     */
    public function destroy($id): JsonResponse
    {
        $doctor = User::role('doctor')->findOrFail($id);

        // Prevent deleting active doctors with patients
        if ($doctor->status === 'active' && $doctor->medicalRecords()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete active doctor with patient records. Please deactivate first.'
            ], 400);
        }

        $doctor->delete();

        return response()->json([
            'message' => 'Doctor deleted successfully'
        ]);
    }
}
