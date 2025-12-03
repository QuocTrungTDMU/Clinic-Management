<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabTestType;
use Illuminate\Http\Request;

class LabTestTypeController extends Controller
{
    /**
     * Get all lab test types
     */
    public function index(Request $request)
    {
        $query = LabTestType::active();

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->byCategory($request->category);
        }

        // Search by name
        if ($request->has('q') && $request->q) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        $query->orderBy('category')->orderBy('name');

        return response()->json($query->get());
    }

    /**
     * Get lab test type by ID
     */
    public function show($id)
    {
        $labTestType = LabTestType::findOrFail($id);
        return response()->json($labTestType);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = [
            ['value' => 'xet_nghiem', 'label' => 'Xét nghiệm'],
            ['value' => 'chuan_doan_hinh_anh', 'label' => 'Chẩn đoán hình ảnh'],
            ['value' => 'tham_do_chuc_nang', 'label' => 'Thăm dò chức năng'],
        ];

        return response()->json($categories);
    }

    /**
     * Get tests by category
     */
    public function byCategory($category)
    {
        $tests = LabTestType::active()
            ->byCategory($category)
            ->orderBy('name')
            ->get();

        return response()->json($tests);
    }
}
