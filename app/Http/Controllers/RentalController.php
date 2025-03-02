<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Support\Facades\Hash;
use League\Config\Exception\ValidationException;
use Illuminate\Support\Facades\Validator;

class RentalController extends Controller
{

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'landlord_id' => 'required|exists:user_detail,user_id',
            'tenant_id' => 'required|exists:user_detail,user_id',
            'room_id' => 'required|exists:room_detail,room_id',

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


}
