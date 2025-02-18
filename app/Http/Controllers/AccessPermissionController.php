<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AccessPermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccessPermissionController extends Controller
{
    public function index()
    {
        try {
            $permissions = AccessPermission::with(['role', 'permissionGroup'])->get();
            return response()->json([
                'status' => 'success',
                'data' => $permissions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,role_id',
            'permission_name' => 'required|string',
            'description' => 'nullable|string',
            'group_id' => 'required|exists:permission_groups,group_id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $permission = AccessPermission::create($request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Permission created successfully',
                'data' => $permission
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,role_id',
            'permission_name' => 'required|string',
            'description' => 'nullable|string',
            'group_id' => 'required|exists:permission_groups,group_id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $permission = AccessPermission::findOrFail($id);
            $permission->update($request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Permission updated successfully',
                'data' => $permission
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $permission = AccessPermission::findOrFail($id);
            $permission->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Permission deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
