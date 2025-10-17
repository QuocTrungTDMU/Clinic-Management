<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MedicineController extends Controller
{
    /**
     * Get all medicines with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Medicine::query();

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // Default: only active medicines
            $query->where('status', 'active');
        }

        // Filter by low stock
        if ($request->has('low_stock') && $request->low_stock) {
            $query->whereColumn('stock_quantity', '<=', 'min_stock_alert');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $medicines = $query->paginate($request->get('per_page', 20));

        return response()->json($medicines);
    }

    /**
     * Search medicines for autocomplete (for doctor's prescription form)
     */
    public function search(Request $request): JsonResponse
    {
        $search = $request->get('q', '');

        $medicines = Medicine::where('status', 'active')
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name', 'medicine_type', 'strength', 'unit', 'selling_price', 'stock_quantity', 'usage_instructions']);

        return response()->json($medicines);
    }

    /**
     * Get single medicine details
     */
    public function show(int $id): JsonResponse
    {
        $medicine = Medicine::findOrFail($id);
        return response()->json($medicine);
    }

    /**
     * Create new medicine (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'medicine_type' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:255',
            'unit' => 'required|string|max:50',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'min_stock_alert' => 'required|integer|min:0',
            'category' => 'nullable|string|max:255',
            'usage_instructions' => 'nullable|string',
            'requires_prescription' => 'boolean',
            'status' => 'in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $medicine = Medicine::create($request->all());

        return response()->json([
            'message' => 'Medicine created successfully',
            'medicine' => $medicine
        ], 201);
    }

    /**
     * Update medicine (Admin only)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $medicine = Medicine::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'medicine_type' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:255',
            'unit' => 'sometimes|required|string|max:50',
            'cost_price' => 'sometimes|required|numeric|min:0',
            'selling_price' => 'sometimes|required|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'min_stock_alert' => 'sometimes|required|integer|min:0',
            'category' => 'nullable|string|max:255',
            'usage_instructions' => 'nullable|string',
            'requires_prescription' => 'boolean',
            'status' => 'in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $medicine->update($request->all());

        return response()->json([
            'message' => 'Medicine updated successfully',
            'medicine' => $medicine
        ]);
    }

    /**
     * Update stock quantity (for inventory management)
     */
    public function updateStock(Request $request, int $id): JsonResponse
    {
        $medicine = Medicine::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer',
            'action' => 'required|in:add,subtract,set',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $quantity = $request->quantity;
        $action = $request->action;

        switch ($action) {
            case 'add':
                $medicine->increaseStock($quantity);
                break;
            case 'subtract':
                if (!$medicine->decreaseStock($quantity)) {
                    return response()->json([
                        'message' => 'Insufficient stock'
                    ], 400);
                }
                break;
            case 'set':
                $medicine->stock_quantity = $quantity;
                $medicine->save();
                break;
        }

        return response()->json([
            'message' => 'Stock updated successfully',
            'medicine' => $medicine
        ]);
    }

    /**
     * Get medicines that are low in stock
     */
    public function lowStock(): JsonResponse
    {
        $medicines = Medicine::where('status', 'active')
            ->whereColumn('stock_quantity', '<=', 'min_stock_alert')
            ->orderBy('stock_quantity')
            ->get();

        return response()->json([
            'medicines' => $medicines,
            'count' => $medicines->count()
        ]);
    }

    /**
     * Get medicine categories
     */
    public function categories(): JsonResponse
    {
        $categories = Medicine::where('status', 'active')
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return response()->json($categories);
    }
}
