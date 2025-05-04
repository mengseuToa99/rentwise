<?php

namespace App\Http\Controllers;

use App\Models\UserDetail;
use App\Models\Property;
use App\Models\Invoice;
use App\Models\Rental;
use App\Models\RoomDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getDashboardStats()
    {
        try {
            $user = Auth::user();
            
            // Get user role with a default value
            $role = $user->roles->first()->role_name ?? 'guest';
            
            $stats = [];
            
            if ($role === 'admin') {
                // Admin dashboard stats
                $stats = [
                    'totalUsers' => UserDetail::count(),
                    'totalProperties' => Property::count(),
                    'totalInvoices' => Invoice::count(),
                    'pendingVerifications' => UserDetail::where('status', '!=', 'active')->count(),
                ];
            } elseif ($role === 'landlord') {
                // Landlord dashboard stats
                $stats = [
                    'totalProperties' => Property::where('landlord_id', $user->user_id)->count(),
                    'totalRentals' => Rental::whereHas('room.property', function($query) use ($user) {
                        $query->where('landlord_id', $user->user_id);
                    })->count(),
                    'totalInvoices' => Invoice::whereHas('rental.room.property', function($query) use ($user) {
                        $query->where('landlord_id', $user->user_id);
                    })->count(),
                    'pendingPayments' => Invoice::whereHas('rental.room.property', function($query) use ($user) {
                        $query->where('landlord_id', $user->user_id);
                    })->where('payment_status', 'pending')->count(),
                ];
            } elseif ($role === 'tenant') {
                // Tenant dashboard stats
                $stats = [
                    'activeRentals' => Rental::where('tenant_id', $user->user_id)
                        ->whereNull('end_date')
                        ->count(),
                    'totalInvoices' => Invoice::whereHas('rental', function($query) use ($user) {
                        $query->where('tenant_id', $user->user_id);
                    })->count(),
                    'pendingPayments' => Invoice::whereHas('rental', function($query) use ($user) {
                        $query->where('tenant_id', $user->user_id);
                    })->where('payment_status', 'pending')->count(),
                    'totalProperties' => Rental::where('tenant_id', $user->user_id)
                        ->whereNull('end_date')
                        ->with('room.property')
                        ->get()
                        ->pluck('room.property')
                        ->unique('property_id')
                        ->count(),
                ];
            }

            return response()->json([
                [
                    'status' => 'success',
                    'data' => $stats,
                    'role' => $role
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                [
                    'status' => 'error',
                    'message' => 'Failed to fetch dashboard statistics',
                    'error' => $e->getMessage()
                ]
            ], 500);
        }
    }
} 