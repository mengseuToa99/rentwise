<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use App\Models\UserDetail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function getUsersByRole($roleName = null)
    {
        // Define valid roles
        $validRoles = ['renter', 'landlord']; // Add other roles if needed

        // If a role is provided, validate it
        if ($roleName && !in_array($roleName, $validRoles)) {
            return response()->json(['message' => 'Invalid role specified'], 400);
        }

        // Query users
        $users = UserDetail::when($roleName, function ($query) use ($roleName) {
            // Filter by role if a role is provided
            return $query->whereHas('roles', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            });
        })
        ->with('roles', 'verification', 'sessions')
        ->get();

        return response()->json($users);
    }

    /**
     * Get all users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $users = UserDetail::with('roles', 'verification', 'sessions')->get();
        return response()->json($users);
    }

    /**
     * Get a specific user by ID.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = UserDetail::with('roles', 'verification', 'sessions')->find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json($user);
    }

    /**
     * Create a new user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|unique:user_detail',
            'password_hash' => 'required|min:6',
            'email' => 'required|email|unique:user_detail',
            'phone_number' => 'nullable|string',
            'profile_picture' => 'nullable|string',
            'id_card_picture' => 'nullable|string',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'role' => 'required|in:renter,landlord,admin', // Updated valid roles
        ]);
    
        try {
            DB::beginTransaction();
    
            // Create user
            $user = UserDetail::create([
                'username' => $validated['username'],
                'password_hash' => Hash::make($validated['password_hash']),
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'],
                'profile_picture' => $validated['profile_picture'],
                'id_card_picture' => $validated['id_card_picture'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'status' => 'active',
            ]);
    
            // Add debug logging
            \Log::info('Looking for role:', ['role_name' => $validated['role']]);
            
            // Get role ID and add error handling
            $role = Role::where('role_name', $validated['role'])->first();
            
            if (!$role) {
                DB::rollBack();
                \Log::error('Role not found:', ['role_name' => $validated['role']]);
                return response()->json([
                    'error' => 'Role not found',
                    'available_roles' => Role::pluck('role_name')
                ], 400);
            }
    
            // Assign role using sync without detaching
            $user->roles()->syncWithoutDetaching([$role->role_id]);
    
            DB::commit();
    
            return response()->json([
                'message' => 'User created with role successfully',
                'user' => $user->load('roles')
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('User creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'User creation failed',
                'message' => $e->getMessage(),
                'available_roles' => Role::pluck('role_name')
            ], 500);
        }
    }
    /**
     * Update an existing user.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $user = UserDetail::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|unique:user_details,username,' . $id . ',user_id',
            'password_hash' => 'sometimes|min:6',
            'email' => 'sometimes|email|unique:user_details,email,' . $id . ',user_id',
            'phone_number' => 'nullable|string',
            'profile_picture' => 'nullable|string',
            'id_card_picture' => 'nullable|string',
            'first_name' => 'sometimes|string',
            'last_name' => 'sometimes|string',
            'status' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        if ($request->has('password_hash')) {
            $request->merge(['password_hash' => Hash::make($request->password_hash)]);
        }

        $user->update($request->all());
        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    /**
     * Delete a user.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $user = UserDetail::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Assign roles to a user.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignRoles(Request $request, $id)
    {
        $user = UserDetail::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $user->roles()->sync($request->role_ids);
        return response()->json(['message' => 'Roles assigned successfully']);
    }

    /**
     * Verify a user.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyUser($id)
    {
        $user = UserDetail::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->verification()->updateOrCreate(
            ['user_id' => $id],
            ['verified' => true, 'verified_at' => now()]
        );

        return response()->json(['message' => 'User verified successfully']);
    }
}