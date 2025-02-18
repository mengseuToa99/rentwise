<?php

// app/Http/Controllers/Api/PermissionGroupController.php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PermissionGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PermissionGroupController extends Controller
{
    public function index()
    {
        try {
            $groups = PermissionGroup::all();
            return response()->json([
                'status' => 'success',
                'data' => $groups
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch permission groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'group_name' => 'required|string|unique:permission_groups',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $group = PermissionGroup::create($request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Permission group created successfully',
                'data' => $group
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create permission group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'group_name' => 'required|string|unique:permission_groups,group_name,'.$id.',group_id',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $group = PermissionGroup::findOrFail($id);
            $group->update($request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Permission group updated successfully',
                'data' => $group
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update permission group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $group = PermissionGroup::findOrFail($id);
            $group->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Permission group deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete permission group',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
