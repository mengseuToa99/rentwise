<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Models\AccessPermission;
use App\Models\PermissionGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RolePermissionController extends Controller
{
    /**
     * Assign role to user
     */
    public function assignRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:user_detail,user_id',
            'role_id' => 'required|exists:roles,role_id'
        ]);

        try {
            DB::beginTransaction();

            UserRole::create([
                'user_id' => $request->user_id,
                'role_id' => $request->role_id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Log the action
            Log::create([
                'user_id' => auth()->id(),
                'action' => 'ROLE_ASSIGNED',
                'description' => "Role ID {$request->role_id} assigned to User ID {$request->user_id}",
                'timestamp' => now()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Role assigned successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to assign role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new role with permissions
     */
    public function createRole(Request $request)
    {
        $request->validate([
            'role_name' => 'required|unique:roles,role_name',
            'description' => 'required',
            'permissions' => 'required|array',
            'parent_role_id' => 'nullable|exists:roles,role_id'
        ]);

        try {
            DB::beginTransaction();

            $role = Role::create([
                'role_name' => $request->role_name,
                'description' => $request->description,
                'parent_role_id' => $request->parent_role_id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            foreach ($request->permissions as $permission) {
                AccessPermission::create([
                    'role_id' => $role->role_id,
                    'permission_name' => $permission['name'],
                    'description' => $permission['description'],
                    'group_id' => $permission['group_id'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            Log::create([
                'user_id' => auth()->id(),
                'action' => 'ROLE_CREATED',
                'description' => "New role '{$request->role_name}' created",
                'timestamp' => now()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Role and permissions created successfully',
                'role' => $role
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user has specific permission
     */
    public function checkPermission(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:user_detail,user_id',
            'permission_name' => 'required'
        ]);

        try {
            $hasPermission = DB::table('user_roles')
                ->join('access_permissions', 'user_roles.role_id', '=', 'access_permissions.role_id')
                ->where('user_roles.user_id', $request->user_id)
                ->where('access_permissions.permission_name', $request->permission_name)
                ->exists();

            return response()->json([
                'has_permission' => $hasPermission
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to check permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all permissions for a user
     */
    public function getUserPermissions($userId)
    {
        try {
            $permissions = DB::table('user_roles')
                ->join('access_permissions', 'user_roles.role_id', '=', 'access_permissions.role_id')
                ->join('permission_groups', 'access_permissions.group_id', '=', 'permission_groups.group_id')
                ->where('user_roles.user_id', $userId)
                ->select('permission_groups.group_name', 'access_permissions.permission_name', 'access_permissions.description')
                ->get()
                ->groupBy('group_name');

            return response()->json([
                'permissions' => $permissions
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch user permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update role permissions
     */
    public function updateRolePermissions(Request $request, $roleId)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*.permission_name' => 'required',
            'permissions.*.description' => 'required',
            'permissions.*.group_id' => 'required|exists:permission_groups,group_id'
        ]);

        try {
            DB::beginTransaction();

            // Delete existing permissions
            AccessPermission::where('role_id', $roleId)->delete();

            // Add new permissions
            foreach ($request->permissions as $permission) {
                AccessPermission::create([
                    'role_id' => $roleId,
                    'permission_name' => $permission['permission_name'],
                    'description' => $permission['description'],
                    'group_id' => $permission['group_id'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            Log::create([
                'user_id' => auth()->id(),
                'action' => 'ROLE_PERMISSIONS_UPDATED',
                'description' => "Permissions updated for role ID {$roleId}",
                'timestamp' => now()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Role permissions updated successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update role permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}