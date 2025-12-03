<?php

namespace App\Http\Controllers;

use App\Models\LabTestType;
use Illuminate\Http\Request;

class LabTestTypeController extends Controller
{
    /**
     * List all lab test types
     */
    public function index(Request $request)
    {
        $query = LabTestType::query();

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search by name or code
        if ($request->has('search')) {
            $keyword = $request->search;
            $query->where(function ($q) use ($keyword) {
                $q->where('code', 'LIKE', "%{$keyword}%")
                    ->orWhere('name', 'LIKE', "%{$keyword}%");
            });
        }

        $testTypes = $query->orderBy('code')->get();
        return response()->json($testTypes);
    }

    /**
     * Get lab test type by ID
     */
    public function show($id)
    {
        $testType = LabTestType::findOrFail($id);
        return response()->json($testType);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = LabTestType::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }

    /**
     * Get test types by category
     */
    public function byCategory($category)
    {
        $testTypes = LabTestType::where('category', $category)
            ->orderBy('code')
            ->get();

        return response()->json($testTypes);
    }
}
