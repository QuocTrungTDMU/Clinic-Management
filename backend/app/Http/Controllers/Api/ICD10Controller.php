<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ICD10Code;
use Illuminate\Http\Request;

class ICD10Controller extends Controller
{
    /**
     * Search ICD-10 codes
     */
    public function search(Request $request)
    {
        $query = ICD10Code::query();

        // Search by name or code
        if ($request->has('q') && $request->q) {
            $query->search($request->q);
        }

        // Filter by specialty
        if ($request->has('specialty') && $request->specialty) {
            $query->bySpecialty($request->specialty);
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Only common diseases
        if ($request->has('common') && $request->common) {
            $query->common();
        }

        // Order by common first, then by name
        $query->orderBy('is_common', 'desc')
            ->orderBy('name', 'asc');

        // Paginate or get all
        $limit = $request->input('limit', 20);

        if ($request->has('all')) {
            return response()->json($query->get());
        }

        return response()->json($query->paginate($limit));
    }

    /**
     * Get ICD-10 by ID
     */
    public function show($id)
    {
        $icd10 = ICD10Code::findOrFail($id);
        return response()->json($icd10);
    }

    /**
     * Get ICD-10 by code
     */
    public function getByCode($code)
    {
        $icd10 = ICD10Code::where('code', $code)->firstOrFail();
        return response()->json($icd10);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = ICD10Code::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }

    /**
     * Get common diseases by specialty
     */
    public function commonBySpecialty($specialty)
    {
        $diseases = ICD10Code::common()
            ->bySpecialty($specialty)
            ->orderBy('name')
            ->get();

        return response()->json($diseases);
    }
}
