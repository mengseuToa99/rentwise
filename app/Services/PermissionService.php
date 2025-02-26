<?php

namespace App\Services;

use App\Models\AccessPermission;
use App\Models\User;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Facades\Cache;

class PermissionService
{
    /**
     * Check if a user has a specific permission
     *
     * @param User $user The user to check permissions for
     * @param string $permissionName The permission name to check
     * @return bool Whether the user has the permission
     */
    public function hasPermission(User $user, string $permissionName): bool
    {
        // Get the user's roles (assuming you have a roles relationship in your User model)
        $roleIds = $user->roles()->pluck('role_id')->toArray();
        
        if (empty($roleIds)) {
            return false;
        }
        
        // Cache key for user permissions to improve performance
        $cacheKey = "user_permissions_{$user->id}";
        
        // Check if permissions are cached
        if (!Cache::has($cacheKey)) {
            // Get all permissions for the user's roles
            $permissions = AccessPermission::whereIn('role_id', $roleIds)
                                    ->pluck('permission_name')
                                    ->toArray();
            
            // Cache the permissions for faster future checks (cache for 60 minutes)
            Cache::put($cacheKey, $permissions, 60 * 60);
        } else {
            $permissions = Cache::get($cacheKey);
        }
        
        // Check if the required permission exists in the user's permissions
        return in_array($permissionName, $permissions);
    }
    
    /**
     * Check if a user has any of the specified permissions
     *
     * @param User $user The user to check
     * @param array $permissionNames Array of permission names to check
     * @return bool Whether the user has any of the permissions
     */
    public function hasAnyPermission(User $user, array $permissionNames): bool
    {
        foreach ($permissionNames as $permission) {
            if ($this->hasPermission($user, $permission)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if a user has all of the specified permissions
     *
     * @param User $user The user to check
     * @param array $permissionNames Array of permission names to check
     * @return bool Whether the user has all of the permissions
     */
    public function hasAllPermissions(User $user, array $permissionNames): bool
    {
        foreach ($permissionNames as $permission) {
            if (!$this->hasPermission($user, $permission)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get all permissions for a specific user
     *
     * @param User $user The user to get permissions for
     * @return array Array of permission names
     */
    public function getUserPermissions(User $user): array
    {
        $roleIds = $user->roles()->pluck('role_id')->toArray();
        
        if (empty($roleIds)) {
            return [];
        }
        
        $permissions = AccessPermission::whereIn('role_id', $roleIds)
                                ->pluck('permission_name')
                                ->toArray();
                                
        return $permissions;
    }
    
    /**
     * Clear the permissions cache for a user
     *
     * @param User $user The user to clear cache for
     * @return void
     */
    public function clearPermissionCache(User $user): void
    {
        Cache::forget("user_permissions_{$user->id}");
    }
}