<?php

namespace App\Http\Controllers;

use App\Models\ICD10Code;
use Illuminate\Http\Request;

class ICD10Controller extends Controller
{
    /**
     * Search ICD-10 codes by name or code
     */
    public function search(Request $request)
    {
        $query = ICD10Code::query();

        // Search by keyword
        if ($request->has('q')) {
            $keyword = $request->q;
            $query->where(function ($q) use ($keyword) {
                $q->where('code', 'LIKE', "%{$keyword}%")
                    ->orWhere('name', 'LIKE', "%{$keyword}%")
                    ->orWhere('name_en', 'LIKE', "%{$keyword}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by specialty
        if ($request->has('specialty')) {
            $query->where('specialty', $request->specialty);
        }

        // Filter common diseases only
        if ($request->has('common')) {
            $query->where('is_common', true);
        }

        // Pagination
        $limit = $request->get('limit', 15);
        $results = $query->orderBy('code')->paginate($limit);

        return response()->json($results);
    }

    /**
     * Get ICD-10 code by ID
     */
    public function show($id)
    {
        $code = ICD10Code::findOrFail($id);
        return response()->json($code);
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
        $codes = ICD10Code::where('specialty', $specialty)
            ->where('is_common', true)
            ->orderBy('code')
            ->get();

        return response()->json($codes);
    }
}
