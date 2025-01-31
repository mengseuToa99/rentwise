<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
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
            
            \Log::info('Login attempt details:', [
                'email_provided' => $credentials['email'],
                'user_found' => (bool)$user,
                'user_status' => $user ? $user->status : null,
                'hash_matches' => $user ? Hash::check($credentials['password'], $user->password_hash) : false
            ]);
    
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
    
            // If we get here, password didn't match
            \Log::warning('Failed login attempt:', [
                'email' => $credentials['email'],
                'password_length' => strlen($credentials['password'])
            ]);
    
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
    
        } catch (\Exception $e) {
            \Log::error('Login error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
    
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred during login',
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

    public function register(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out'], 200);
    }
}