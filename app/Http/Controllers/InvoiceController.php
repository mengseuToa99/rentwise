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


    // In your controller
    public function getDueUtilityReadings(Request $request)
    {
        $request->validate([
            'property_id' => 'required|exists:property_detail,property_id',
        ]);

        // Check if we have cached due readings
        $cachedReadings = DB::table('system_settings')
            ->where('setting_name', 'due_utility_readings_' . $request->property_id)
            ->first();

        if ($cachedReadings) {
            return response()->json([
                'due_invoices' => json_decode($cachedReadings->setting_value)
            ]);
        }

        // If not in cache, calculate on the fly
        $utilityService = app(UtilityService::class);
        $dueRooms = $utilityService->getRoomsDueForUtilityCalculation($request->property_id);

        return response()->json([
            'due_invoices' => $dueRooms
        ]);
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
}
