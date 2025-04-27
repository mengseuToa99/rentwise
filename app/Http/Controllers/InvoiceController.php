<?php

namespace App\Http\Controllers;

use App\Models\RentalDetail;
use App\Models\RoomDetail;
use App\Models\UtilityUsage;
use App\Models\Utilities;
use App\Models\UtilityPrices;
use App\Models\InvoiceDetail;

use App\Models\Utility;
use App\Models\UtilityPrice;
use App\Services\UtilityService;
use Carbon\Carbon;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{

    /**
     * Get invoices grouped by tenant for a landlord
     *
     * @param int $landlordId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvoicesByTenant($landlordId)
    {
        try {
            // Get all rentals managed by this landlord
            $rentals = RentalDetail::with(['tenant', 'room.property'])
                ->whereHas('room.property', function ($query) use ($landlordId) {
                    $query->where('landlord_id', $landlordId);
                })
                ->get();

            // Group rentals by tenant
            $tenantRentals = $rentals->groupBy('tenant_id');

            $response = [];

            foreach ($tenantRentals as $tenantId => $tenantRentalsList) {
                // Get tenant details from the first rental
                $tenant = $tenantRentalsList->first()->tenant;

                $tenantData = [
                    'tenant_id' => $tenant->user_id,
                    'tenant_name' => $tenant->first_name . ' ' . $tenant->last_name,
                    'rentals' => []
                ];

                // Process each rental for this tenant
                foreach ($tenantRentalsList as $rental) {
                    $rentalData = [
                        'rental_id' => $rental->rental_id,
                        'room' => [
                            'room_id' => $rental->room_id,
                            'room_number' => $rental->room->room_number,
                            'property_name' => $rental->room->property->property_name ?? 'Unknown Property',
                            'rent_amount' => $rental->room->rent_amount
                        ],
                        'invoices' => []
                    ];

                    // Get invoices for this rental
                    $invoices = InvoiceDetail::where('rental_id', $rental->rental_id)
                        ->orderBy('due_date', 'desc')
                        ->get();

                    // Get utility usages for this room
                    $utilityUsages = UtilityUsage::with('utility')
                        ->where('room_id', $rental->room_id)
                        ->get()
                        ->groupBy(function ($usage) {
                            return Carbon::parse($usage->usage_date)->format('Y-m');
                        });

                    // Process each invoice
                    foreach ($invoices as $invoice) {
                        $billingMonth = Carbon::parse($invoice->due_date)->subMonth()->format('Y-m');
                        $utilities = $utilityUsages->get($billingMonth, []);

                        $utilityTotal = collect($utilities)->sum('cost');
                        $rentAmount = $rental->room->rent_amount;
                        $otherCharges = $invoice->amount_due - $rentAmount - $utilityTotal;

                        $invoiceData = [
                            'invoice_id' => $invoice->invoice_id,
                            'invoice_date' => $invoice->created_at->format('Y-m-d'),
                            'due_date' => $invoice->due_date,
                            'billing_month' => $billingMonth,
                            'amount_due' => $invoice->amount_due,
                            'paid' => $invoice->paid,
                            'payment_status' => $invoice->payment_status,
                            'payment_method' => $invoice->payment_method,
                            'amount_breakdown' => [
                                'rent' => number_format($rentAmount, 2),
                                'utilities' => number_format($utilityTotal, 2),
                                'other_charges' => number_format($otherCharges, 2),
                                'total' => number_format($invoice->amount_due, 2)
                            ],
                            'utility_details' => collect($utilities)->mapWithKeys(function ($usage) {
                                return [$usage->utility->utility_name => [
                                    'old_reading' => $usage->old_meter_reading,
                                    'new_reading' => $usage->new_meter_reading,
                                    'consumption' => $usage->amount_used,
                                    'rate' => $usage->amount_used > 0
                                        ? number_format($usage->cost / $usage->amount_used, 2)
                                        : "0.00",
                                    'cost' => number_format($usage->cost, 2),
                                    'usage_date' => $usage->usage_date
                                ]];
                            })->toArray()
                        ];

                        $rentalData['invoices'][] = $invoiceData;
                    }

                    $tenantData['rentals'][] = $rentalData;
                }

                // Add summary statistics for this tenant
                $tenantData['summary'] = [
                    'total_rentals' => count($tenantData['rentals']),
                    'total_invoices' => array_sum(array_map(function ($rental) {
                        return count($rental['invoices']);
                    }, $tenantData['rentals'])),
                    'outstanding_amount' => number_format(
                        array_sum(array_map(function ($rental) {
                            return array_sum(array_map(function ($invoice) {
                                return $invoice['payment_status'] === 'pending' ?
                                    (float)str_replace(',', '', $invoice['amount_breakdown']['total']) : 0;
                            }, $rental['invoices']));
                        }, $tenantData['rentals'])),
                        2
                    )
                ];

                $response[] = $tenantData;
            }

            return response()->json([
                'landlord_id' => $landlordId,
                'tenants' => $response
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve tenant invoices',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Get rooms that need utility readings in the next 3-4 days for invoice preparation
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDueUtilityReadings()
    {
        try {
            // Get authenticated user
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Unauthenticated'
                ], 401);
            }

            // Get current date and date range for checking
            $today = Carbon::today();
            $startDate = $today->copy()->addDays(3);
            $endDate = $today->copy()->addDays(4);

            // Get active rentals that need readings soon
            $dueRooms = RentalDetail::with([
                'room.property',
                'tenant',
                'room.utilityUsages' => function($query) {
                    $query->latest('usage_date')
                         ->take(1)
                         ->with('utility');
                },
                'invoiceDetails' => function($query) {
                    $query->latest('created_at')
                         ->take(1); // Get the most recent invoice
                }
            ])
            ->whereHas('room.property', function($query) use ($user) {
                $query->where('landlord_id', $user->user_id);
            })
            ->whereNull('end_date') // Only active rentals
            ->get();

            // Filter rooms based on due dates
            $filteredRooms = $dueRooms->filter(function($rental) use ($startDate, $endDate) {
                // Get the next due date for this rental
                $nextDueDate = Carbon::parse($rental->due_date);
                
                // If the due date has passed, calculate the next month's due date
                while ($nextDueDate->isPast()) {
                    $nextDueDate->addMonth();
                }

                // Check if the next due date falls within our target range
                return $nextDueDate->between($startDate, $endDate);
            });

            // Format the response
            $formattedResponse = $filteredRooms->map(function ($rental) {
                // Get the latest invoice if it exists
                $latestInvoice = $rental->invoiceDetails->first();

                // Calculate next due date
                $nextDueDate = Carbon::parse($rental->due_date);
                while ($nextDueDate->isPast()) {
                    $nextDueDate->addMonth();
                }

                return [
                    'rental_id' => $rental->rental_id,
                    'next_reading_date' => $nextDueDate->copy()->subDays(1)->format('Y-m-d'),
                    'days_until_due' => Carbon::today()->diffInDays($nextDueDate),
                    'property' => [
                        'property_id' => $rental->room->property->property_id,
                        'property_name' => $rental->room->property->property_name,
                        'address' => $rental->room->property->address
                    ],
                    'room' => [
                        'room_id' => $rental->room->room_id,
                        'room_name' => $rental->room->room_name,
                        'room_type' => $rental->room->room_type,
                        'rent_amount' => number_format($rental->room->rent_amount, 2)
                    ],
                    'tenant' => [
                        'tenant_id' => $rental->tenant->user_id,
                        'name' => $rental->tenant->name,
                        'email' => $rental->tenant->email,
                        'phone' => $rental->tenant->phone
                    ],
                    'current_utility_readings' => collect($rental->room->utilityUsages)->map(function ($usage) {
                        return [
                            'utility_name' => $usage->utility->utility_name,
                            'last_reading' => $usage->new_meter_reading,
                            'last_reading_date' => $usage->usage_date,
                            'utility_id' => $usage->utility_id
                        ];
                    })->values(),
                    'latest_invoice' => $latestInvoice ? [
                        'invoice_id' => $latestInvoice->invoice_id,
                        'amount_due' => number_format($latestInvoice->amount_due, 2),
                        'due_date' => $latestInvoice->due_date,
                        'paid' => $latestInvoice->paid,
                        'payment_method' => $latestInvoice->payment_method,
                        'payment_status' => $latestInvoice->payment_status,
                        'created_at' => $latestInvoice->created_at,
                        'updated_at' => $latestInvoice->updated_at
                    ] : null,
                    'preparation_info' => [
                        'suggested_reading_date' => $nextDueDate->copy()->subDays(1)->format('Y-m-d'),
                        'invoice_month' => Carbon::today()->format('Y-m'),
                        'next_due_date' => $nextDueDate->format('Y-m-d')
                    ]
                ];
            });

            // Add summary statistics
            $summary = [
                'total_rooms_due' => $filteredRooms->count(),
                'total_with_pending_invoices' => $filteredRooms->filter(function($rental) {
                    return $rental->invoiceDetails->first() && 
                           $rental->invoiceDetails->first()->payment_status === 'pending';
                })->count(),
                'date_range' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d')
                ],
                'notification_message' => 'These rooms require utility readings soon for invoice generation.'
            ];

            return response()->json([
                'rooms_needing_readings' => $formattedResponse,
                'summary' => $summary,
                'current_date' => $today->format('Y-m-d'),
                'debug_info' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'total_rentals_before_filter' => $dueRooms->count(),
                    'total_rentals_after_filter' => $filteredRooms->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve rooms needing readings',
                'message' => $e->getMessage(),
                'trace' => env('APP_DEBUG') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Get comprehensive invoice details
     *
     * @param int $invoiceId
     * @return \Illuminate\Http\JsonResponse
     */





    public function getAllMonthlyInvoices($rentalId)
    {
        try {
            // Load rental with room and tenant
            $rental = RentalDetail::with(['room', 'tenant'])
                ->findOrFail($rentalId);

            // Get invoices
            $invoices = InvoiceDetail::where('rental_id', $rentalId)
                ->orderBy('due_date', 'desc')
                ->get();

            // Get all utility usages for this room
            $utilityUsages = UtilityUsage::with('utility')
                ->where('room_id', $rental->room_id)
                ->get()
                ->groupBy(function ($usage) {
                    return Carbon::parse($usage->usage_date)->format('Y-m');
                });

            $response = [
                'tenant' => [
                    'id' => $rental->tenant->user_id,
                    'name' => $rental->tenant->first_name . ' ' . $rental->tenant->last_name
                ],
                'room' => [
                    'room_id' => $rental->room_id,
                    'room_number' => $rental->room->room_number,
                    'room_type' => $rental->room->room_type,
                    'rent_amount' => $rental->room->rent_amount
                ],
                'invoices' => $invoices->map(function ($invoice) use ($utilityUsages, $rental) {
                    $billingMonth = Carbon::parse($invoice->due_date)->subMonth()->format('Y-m');
                    $utilities = $utilityUsages->get($billingMonth, []);

                    $utilityTotal = collect($utilities)->sum('cost');
                    $rentAmount = $rental->room->rent_amount;
                    $otherCharges = $invoice->amount_due - $rentAmount - $utilityTotal;

                    return [
                        'invoice_id' => $invoice->invoice_id,
                        'invoice_date' => $invoice->created_at->format('Y-m-d'),
                        'due_date' => $invoice->due_date,
                        'billing_month' => $billingMonth,
                        'amount_due' => $invoice->amount_due,
                        'paid' => $invoice->paid,
                        'payment_status' => $invoice->payment_status,
                        'payment_method' => $invoice->payment_method,
                        'amount_breakdown' => [
                            'rent' => number_format($rentAmount, 2),
                            'utilities' => number_format($utilityTotal, 2),
                            'other_charges' => number_format($otherCharges, 2),
                            'total' => number_format($invoice->amount_due, 2)
                        ],
                        'utility_details' => collect($utilities)->mapWithKeys(function ($usage) {
                            return [$usage->utility->utility_name => [
                                'old_reading' => $usage->old_meter_reading,
                                'new_reading' => $usage->new_meter_reading,
                                'consumption' => $usage->amount_used,
                                'rate' => $usage->amount_used > 0
                                    ? number_format($usage->cost / $usage->amount_used, 2)
                                    : "0.00",
                                'cost' => number_format($usage->cost, 2),
                                'usage_date' => $usage->usage_date
                            ]];
                        })->toArray(),
                        'next_month_old_readings' => collect($utilities)->mapWithKeys(function ($usage) {
                            return [$usage->utility->utility_name => $usage->new_meter_reading];
                        })->toArray()
                    ];
                })
            ];

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve invoices',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Route method to handle invoice detail retrieval
     */


    /**
     * Input utility readings and generate invoice
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function inputUtilityReadings(Request $request)
    {
        $request->validate([
            'rental_id' => 'required|exists:rental_detail,rental_id',
            'utility_readings' => 'required|array',
            'readings_date' => 'required|date',
            'payment_method' => 'nullable|in:cash,credit_card,bank_transfer',
            'billing_month' => 'required|date_format:Y-m'
        ]);

        try {
            DB::beginTransaction();

            $rental = RentalDetail::findOrFail($request->rental_id);
            $billingMonth = $request->billing_month;
            $nextMonthDueDate = Carbon::parse($billingMonth)->addMonth()->format('Y-m-01');

            // Check for existing invoice for this period
            $existingInvoice = InvoiceDetail::where('rental_id', $rental->rental_id)
                ->whereDate('due_date', $nextMonthDueDate)
                ->first();

            if ($existingInvoice) {
                return response()->json([
                    'error' => 'Invoice already exists for this billing period',
                    'invoice' => $existingInvoice
                ], 409);
            }

            // Get the most recent utility readings to use as old readings
            $previousReadings = UtilityUsage::where('room_id', $rental->room_id)
                ->select('utility_id', 'new_meter_reading')
                ->latest('usage_date')
                ->get()
                ->groupBy('utility_id')
                ->map(function ($readings) {
                    return $readings->first()->new_meter_reading;
                });

            // Calculate utility costs and prepare usage records
            $totalUtilityCost = 0;
            $utilityDetails = [];

            foreach ($request->utility_readings as $utilityName => $newReading) {
                $utility = Utility::where('utility_name', $utilityName)->first();
                if (!$utility) continue;

                $oldReading = $previousReadings[$utility->utility_id] ?? 0;
                $consumption = $newReading - $oldReading;

                $currentPrice = UtilityPrice::where('utility_id', $utility->utility_id)
                    ->where('effective_date', '<=', $request->readings_date)
                    ->orderBy('effective_date', 'desc')
                    ->first();

                $utilityCost = $consumption * ($currentPrice->price ?? 0);
                $totalUtilityCost += $utilityCost;

                $utilityDetails[$utilityName] = [
                    'old_reading' => $oldReading,
                    'new_reading' => $newReading,
                    'consumption' => $consumption,
                    'rate' => $currentPrice->price ?? 0,
                    'cost' => $utilityCost
                ];
            }

            // Create the invoice
            $invoice = InvoiceDetail::create([
                'rental_id' => $rental->rental_id,
                'amount_due' => $rental->room->rent_amount + $totalUtilityCost,
                'due_date' => $nextMonthDueDate,
                'paid' => false,
                'payment_method' => $request->input('payment_method', 'cash'),
                'payment_status' => 'pending'
            ]);

            // Save utility usages with invoice reference
            foreach ($utilityDetails as $utilityName => $details) {
                $utility = Utility::where('utility_name', $utilityName)->first();

                UtilityUsage::create([
                    'room_id' => $rental->room_id,
                    'utility_id' => $utility->utility_id,
                    'invoice_id' => $invoice->invoice_id,
                    'usage_date' => $request->readings_date,
                    'old_meter_reading' => $details['old_reading'],
                    'new_meter_reading' => $details['new_reading'],
                    'amount_used' => $details['consumption'],
                    'cost' => $details['cost']
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Invoice generated successfully',
                'invoice' => $invoice,
                'utility_details' => $utilityDetails,
                // 'next_month_old_readings' => collect($utilityDetails)->mapWithKeys(function ($item, $key) {
                //     return [$key => $item['new_reading']];
                // })
                'total'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to process invoice',
                'details' => $e->getMessage(),
                'trace' => env('APP_DEBUG') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    private function calculateUtilityCost($roomId, $newReadings, $readingsDate)
    {
        $totalCost = 0;
        $details = [];

        foreach ($newReadings as $utilityName => $newReading) {
            // 1. Find the utility
            $utility = Utility::where('utility_name', $utilityName)->first();
            if (!$utility) continue;

            // 2. Get previous reading (or 0 if first time)
            $oldReading = UtilityUsage::where('room_id', $roomId)
                ->where('utility_id', $utility->utility_id)
                ->latest('usage_date')
                ->value('new_meter_reading') ?? 0;

            // 3. Get current price
            $currentPrice = UtilityPrice::where('utility_id', $utility->utility_id)
                ->where('effective_date', '<=', $readingsDate)
                ->latest('effective_date')
                ->firstOrFail(); // Ensures price exists

            // 4. Calculate
            $consumption = $newReading - $oldReading;
            $cost = $consumption * $currentPrice->price;

            $totalCost += $cost;

            // 5. Store details
            $details[$utilityName] = [
                'old_reading' => $oldReading,
                'new_reading' => $newReading,
                'consumption' => $consumption,
                'rate' => $currentPrice->price,
                'cost' => $cost,
                'price_effective_date' => $currentPrice->effective_date
            ];
        }

        return [$totalCost, $details];
    }
    /**
     * Generate monthly invoice for rental
     *
     * @param RentalDetail $rental
     * @param float $utilityCost
     * @param string $readingsDate
     * @param string $paymentMethod
     * @return InvoiceDetail
     */
    private function generateMonthlyInvoice($rental, $amount, $invoiceMonth, $paymentMethod, $invoiceType, $reason = null)
    {
        $dueDate = Carbon::parse($invoiceMonth)->addMonth();

        return InvoiceDetail::create([
            'rental_id' => $rental->rental_id,
            'amount_due' => $amount,
            'due_date' => $dueDate,
            'paid' => false,
            'payment_method' => $paymentMethod,
            'payment_status' => 'pending',
            'invoice_month' => $invoiceMonth,
            'invoice_type' => $invoiceType,
            'invoice_reason' => $reason,
            'is_additional' => $invoiceType !== 'regular'
        ]);
    }

    /**
     * Get all invoices for a landlord with optional date filtering
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLandlordInvoices(Request $request)
    {
        try {
            // Get the authenticated user
            $user = Auth::user();
            
            // Check if user exists
            if (!$user) {
                return response()->json([
                    'message' => 'Unauthenticated'
                ], 401);
            }

            // Check if user is a landlord using the user_roles table
            $isLandlord = DB::table('user_roles')
                ->join('roles', 'user_roles.role_id', '=', 'roles.role_id')
                ->where('user_roles.user_id', $user->user_id)
                ->where('roles.role_name', 'landlord')
                ->exists();

            if (!$isLandlord) {
                return response()->json([
                    'message' => 'Only landlords can access this endpoint'
                ], 403);
            }

            // Validate date filters if provided
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'status' => 'nullable|string|in:pending,paid,overdue'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Invalid date range',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get all rentals managed by this landlord with their invoices
            $query = InvoiceDetail::with(['rental.room.property', 'rental.tenant'])
                ->whereHas('rental.room.property', function ($query) use ($user) {
                    $query->where('landlord_id', $user->user_id);
                });

            // Apply date filters if provided
            if ($request->has('start_date')) {
                $query->where('due_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('due_date', '<=', $request->end_date);
            }
            if ($request->has('status')) {
                $query->where('payment_status', $request->status);
            }

            // Get the results ordered by due date
            $invoices = $query->orderBy('due_date', 'desc')->get();

            // Get utility usages for all relevant rooms
            $roomIds = $invoices->pluck('rental.room_id')->unique();
            $utilityUsages = UtilityUsage::with(['utility'])
                ->whereIn('room_id', $roomIds)
                ->get()
                ->groupBy('room_id');

            // Format the response
            $formattedInvoices = $invoices->map(function ($invoice) use ($utilityUsages) {
                $roomId = $invoice->rental->room_id;
                $billingMonth = Carbon::parse($invoice->due_date)->subMonth()->format('Y-m');
                
                // Get utility usages for this room and billing month
                $utilities = collect($utilityUsages->get($roomId, []))
                    ->filter(function ($usage) use ($billingMonth) {
                        return Carbon::parse($usage->usage_date)->format('Y-m') === $billingMonth;
                    });

                $utilityTotal = $utilities->sum('cost');
                $rentAmount = $invoice->rental->room->rent_amount;
                $otherCharges = $invoice->amount_due - $rentAmount - $utilityTotal;

                return [
                    'invoice_id' => $invoice->invoice_id,
                    'invoice_date' => $invoice->created_at->format('Y-m-d'),
                    'due_date' => $invoice->due_date,
                    'billing_month' => $billingMonth,
                    'property' => [
                        'property_id' => $invoice->rental->room->property->property_id,
                        'property_name' => $invoice->rental->room->property->property_name,
                        'address' => $invoice->rental->room->property->address
                    ],
                    'room' => [
                        'room_id' => $invoice->rental->room->room_id,
                        'room_name' => $invoice->rental->room->room_name,
                        'room_type' => $invoice->rental->room->room_type,
                        'rent_amount' => $rentAmount
                    ],
                    'tenant' => [
                        'tenant_id' => $invoice->rental->tenant->user_id,
                        'name' => $invoice->rental->tenant->name,
                        'email' => $invoice->rental->tenant->email
                    ],
                    'amount_breakdown' => [
                        'rent' => number_format($rentAmount, 2),
                        'utilities' => number_format($utilityTotal, 2),
                        'other_charges' => number_format($otherCharges, 2),
                        'total' => number_format($invoice->amount_due, 2)
                    ],
                    'utility_details' => $utilities->mapWithKeys(function ($usage) {
                        return [$usage->utility->utility_name => [
                            'old_reading' => $usage->old_meter_reading,
                            'new_reading' => $usage->new_meter_reading,
                            'consumption' => $usage->amount_used,
                            'rate' => $usage->amount_used > 0
                                ? number_format($usage->cost / $usage->amount_used, 2)
                                : "0.00",
                            'cost' => number_format($usage->cost, 2),
                            'usage_date' => $usage->usage_date
                        ]];
                    })->toArray(),
                    'payment_status' => $invoice->payment_status,
                    'payment_method' => $invoice->payment_method
                ];
            });

            // Add summary statistics
            $summary = [
                'total_invoices' => $invoices->count(),
                'total_amount' => number_format($invoices->sum('amount_due'), 2),
                'status_breakdown' => [
                    'pending' => $invoices->where('payment_status', 'pending')->count(),
                    'paid' => $invoices->where('payment_status', 'paid')->count(),
                    'overdue' => $invoices->where('payment_status', 'overdue')->count()
                ],
                'date_range' => [
                    'start' => $request->start_date ?? $invoices->min('due_date'),
                    'end' => $request->end_date ?? $invoices->max('due_date')
                ]
            ];

            return response()->json([
                'invoices' => $formattedInvoices,
                'summary' => $summary,
                'filters_applied' => [
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'status' => $request->status
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving landlord invoices',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}
