<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Support\Facades\Hash;
use League\Config\Exception\ValidationException;

class AuthController extends Controller
{

    public function updateProfileById(Request $request, $id)
    {
        try {
            // Get the authenticated user
            $authUser = Auth::user();
            
            if (!$authUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthenticated'
                ], 401);
            }
    
            // Fetch the target user by ID using the User model
            $targetUser = UserDetail::find($id);
            
            if (!$targetUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found'
                ], 404);
            }
    
            // Authorization: Allow only admins or the user themselves to update
            if (!$authUser->is_admin && $authUser->id != $targetUser->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: You do not have permission to update this profile'
                ], 403);
            }
    
            // Validate the request
            $validatedData = $request->validate([
                'username' => 'sometimes|string|max:255|unique:users,username,' . $targetUser->id,
                'email' => 'sometimes|email|max:255|unique:users,email,' . $targetUser->id,
                'phone_number' => 'sometimes|string|max:20',
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'password' => 'sometimes|string|min:8|confirmed',
            ]);
    
            // Update fields
            foreach ($validatedData as $field => $value) {
                if ($field === 'password') {
                    $targetUser->password = Hash::make($value);
                } else {
                    $targetUser->$field = $value;
                }
            }
    
            $targetUser->save();
    
            // Log the update
            \Log::info('Profile updated:', [
                'updated_by' => $authUser->id,
                'target_user_id' => $targetUser->id,
                'updated_fields' => array_keys($validatedData)
            ]);
    
            return response()->json([
                'status' => 'success',
                'data' => [
                    'user' => $targetUser->fresh()
                ]
            ]);
    
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->error()
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('Profile update error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
    
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while updating profile',
                'debug_message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            // Validate the request
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            // Find the user and explicitly log details
            $user = UserDetail::where('email', $credentials['email'])->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found'
                ], 404);
            }

            // Check status first
            if ($user->status !== 'active') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Account is not active'
                ], 401);
            }

            // Direct password verification
            if (Hash::check($credentials['password'], $user->password_hash)) {
                // Manual authentication
                Auth::login($user);

                // Create token
                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'status' => 'success',
                    'message' => 'Login successful',
                    'data' => [
                        'user' => [
                            'id' => $user->user_id,
                            'username' => $user->username,
                            'email' => $user->email,
                            'first_name' => $user->first_name,
                            'last_name' => $user->last_name,
                            'roles' => $user->roles->pluck('role_name')
                        ],
                        'token' => $token,
                        'token_type' => 'Bearer'
                    ]
                ], 200);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        } catch (\Exception $e) {

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred during login',
                'debug_message' => $e->getMessage()
            ], 500);
        }
    }

    public function profile(Request $request)
    {
        try {
            // Get the authenticated user
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Return the user's profile information
            return response()->json([
                'status' => 'success',
                'data' => [
                    'user' => [
                        'id' => $user->user_id,
                        'username' => $user->username,
                        'profile_img' => $user->profile_img,
                        'email' => $user->email,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'roles' => $user->roles->pluck('role_name'), 
                        'phone_number' => $user->phone_number,
                        'role' => $user->roles->pluck('role_name'),
                        'id_card' => $user->id_card
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching profile information',
                'debug_message' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        // Log out the user
        Auth::logout();
        return response()->json(['message' => 'Logged out'], 200);
    }
}
