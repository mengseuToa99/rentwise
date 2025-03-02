<?php

namespace App\Http\Middleware;

use Closure;
use App\Services\PermissionService;
use Illuminate\Http\Request;

class CheckPermission
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    public function handle(Request $request, Closure $next, $permission)
    {
        if (!$this->permissionService->hasPermission($request->user(), $permission)) {
            return response()->json(['message' => 'Unauthorized. Missing required permission.'], 403);
        }

        return $next($request);
    }
}