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
    public function getInvoiceDetails($invoiceId)
    {
        try {
            // Fetch the invoice with its related rental and room
            $invoice = InvoiceDetail::with(['rental.room', 'rental.tenant', 'rental.landlord'])
                ->findOrFail($invoiceId);

            // Convert due_date to Carbon instance if it's not already
            $dueDate = $invoice->due_date instanceof Carbon
                ? $invoice->due_date
                : Carbon::parse($invoice->due_date);

            // Debugging: Log room_id and due_date
            Log::info('Invoice Room ID:', ['room_id' => $invoice->rental->room_id]);
            Log::info('Due Date:', ['due_date' => $dueDate->toDateTimeString()]);
            Log::info('Usage Date Range:', [
                'start' => $dueDate->copy()->subMonth()->startOfMonth()->toDateTimeString(),
                'end' => $dueDate->endOfMonth()->toDateTimeString()
            ]);

            // Fetch utility usages for this invoice's rental
            $utilityUsages = UtilityUsage::where('room_id', $invoice->rental->room_id)
                ->orderBy('usage_date', 'desc')
                ->get()
                ->unique('utility_id') // This keeps only the latest record for each utility_id
                ->values();

            // Debugging: Log utility usages
            Log::info('Utility Usages:', $utilityUsages->toArray());

            // Prepare utility details
            $utilityDetails = $utilityUsages->map(function ($usage) use ($dueDate) {
                // Find the utility
                $utility = Utility::find($usage->utility_id);
                Log::info('Utility:', $utility ? $utility->toArray() : 'Utility not found');

                if (!$utility) {
                    return null; // Skip if utility is not found
                }

                // Get the price for this utility
                $utilityPrice = UtilityPrice::where('utility_id', $utility->utility_id)
                    ->where('effective_date', '<=', $usage->usage_date)
                    ->orderBy('effective_date', 'desc')
                    ->first();

                Log::info('Utility Price:', $utilityPrice ? $utilityPrice->toArray() : 'Utility Price not found');

                return [
                    'utility_name' => $utility->utility_name,
                    'old_reading' => $usage->old_meter_reading,
                    'new_reading' => $usage->new_meter_reading,
                    'consumption' => $usage->amount_used,
                    'unit_price' => $utilityPrice->price ?? 0,
                    'total_utility_cost' => $usage->amount_used * ($utilityPrice->price ?? 0)
                ];
            })->filter(); // Remove null values

            // Calculate total utility cost
            $totalUtilityCost = $utilityDetails->sum('total_utility_cost');

            // Get room details
            $room = $invoice->rental->room;

            // Prepare full invoice details
            $invoiceDetails = [
                'invoice_id' => $invoice->invoice_id,
                'tenant' => [
                    'id' => $invoice->rental->tenant->user_id,
                    'name' => $invoice->rental->tenant->first_name . ' ' . $invoice->rental->tenant->last_name
                ],
                'room' => [
                    'room_number' => $room->room_number,
                    'room_type' => $room->room_type,
                    'rent_amount' => $room->rent_amount
                ],
                'utilities' => $utilityDetails,
                'financial_summary' => [
                    'room_rent' => $room->rent_amount,
                    'total_utility_cost' => $totalUtilityCost,
                    'total_amount_due' => $room->rent_amount + $totalUtilityCost
                ],
                'invoice_details' => [
                    'due_date' => $dueDate->toDateTimeString(),
                    'payment_status' => $invoice->payment_status,
                    'payment_method' => $invoice->payment_method
                ]
            ];

            return response()->json($invoiceDetails);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve invoice details',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    public function getAllMonthlyInvoices($rentalId)
    {
        try {
            // Validate rental exists
            $rental = RentalDetail::with(['room', 'tenant'])
                ->findOrFail($rentalId);
    
            // Get all invoices for this rental, ordered by due date
            $invoices = InvoiceDetail::where('rental_id', $rentalId)
                ->orderBy('due_date', 'asc')
                ->get();
    
            // If no invoices found, return empty response
            if ($invoices->isEmpty()) {
                return response()->json([
                    'message' => 'No invoices found for this rental',
                    'rental_id' => $rentalId,
                    'invoices' => []
                ]);
            }
    
            // Format the response
            $response = [
                'rental_id' => $rental->rental_id,
                'tenant' => [
                    'id' => $rental->tenant->user_id,
                    'name' => $rental->tenant->first_name . ' ' . $rental->tenant->last_name,
                    'email' => $rental->tenant->email
                ],
                'room' => [
                    'room_id' => $rental->room_id,
                    'room_number' => $rental->room->room_number,
                    'room_type' => $rental->room->room_type,
                    'rent_amount' => $rental->room->rent_amount
                ],
                'rental_period' => [
                    'start_date' => $rental->start_date,
                    'end_date' => $rental->end_date
                ],
                'invoices' => $invoices->map(function ($invoice) {
                    return [
                        'invoice_id' => $invoice->invoice_id,
                        'invoice_number' => $invoice->invoice_number,
                        'amount_due' => $invoice->amount_due,
                        'due_date' => $invoice->due_date,
                        'issued_date' => $invoice->created_at,
                        'payment_status' => $invoice->payment_status,
                        'payment_method' => $invoice->payment_method,
                        'paid_at' => $invoice->paid_at,
                        'notes' => $invoice->notes
                    ];
                })
            ];
    
            return response()->json($response);
    
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Rental not found',
                'message' => 'No rental found with ID: ' . $rentalId
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve invoices',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }


    /**
     * Route method to handle invoice detail retrieval
     */
    public function show($invoiceId)
    {
        return $this->getInvoiceDetails($invoiceId);
    }

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
            'payment_method' => 'nullable|in:cash,credit_card,bank_transfer'
        ]);
    
        try {
            DB::beginTransaction();
    
            // Find the rental
            $rental = RentalDetail::find($request->rental_id);
    
            if (!$rental) {
                return response()->json([
                    'error' => 'Rental not found'
                ], 404);
            }
    
            // Get previous readings for comparison
            $previousReadings = [];
            $utilityUsages = UtilityUsage::where('room_id', $rental->room_id)
                ->latest('usage_date')
                ->get()
                ->groupBy('utility_id');
                
            foreach ($utilityUsages as $utilityId => $usages) {
                if ($usages->isNotEmpty()) {
                    $previousReadings[$utilityId] = [
                        'reading' => $usages->first()->new_meter_reading,
                        'date' => $usages->first()->usage_date
                    ];
                }
            }
    
            // Calculate total utility cost and save utility usage
            list($totalUtilityCost, $utilityDetails) = $this->calculateUtilityCost(
                $rental->room_id, // Get room_id from rental
                $request->utility_readings,
                $request->readings_date,
                $previousReadings
            );
    
            // Generate invoice
            $invoice = $this->generateMonthlyInvoice(
                $rental,
                $totalUtilityCost,
                $request->readings_date,
                $request->input('payment_method', 'cash')
            );
    
            DB::commit();
    
            return response()->json([
                'message' => 'Utility readings recorded and invoice generated',
                'invoice' => $invoice,
                'utility_details' => $utilityDetails,
                'previous_readings' => $previousReadings
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to process utility readings',
                'details' => $e->getMessage(),
                'trace' => env('APP_DEBUG') ? $e->getTraceAsString() : null
            ], 500);
        }
    }


//     protected function calculateUtilityCost($roomId, $utilityReadings, $readingsDate, $previousReadings = [])
// {
//     $totalCost = 0;
//     $utilityDetails = [];
    
//     foreach ($utilityReadings as $utilityType => $currentReading) {
//         $utilityId = $this->getUtilityIdFromType($utilityType);
        
//         if (!$utilityId) {
//             continue; // Skip unknown utility types
//         }
        
//         // Get previous reading or default to 0
//         $previousReading = isset($previousReadings[$utilityId]) ? 
//             (float) $previousReadings[$utilityId]['reading'] : 0;
        
//         // Calculate consumption
//         $consumption = (float) $currentReading - $previousReading;
        
//         // Get rate for this utility type
//         $utilityRate = UtilityRate::where('utility_id', $utilityId)->first();
//         $rate = $utilityRate ? $utilityRate->rate_per_unit : 0;
        
//         // Calculate cost
//         $cost = $consumption * $rate;
//         $totalCost += $cost;
        
//         // Save utility usage
//         UtilityUsage::create([
//             'room_id' => $roomId,
//             'utility_id' => $utilityId,
//             'usage_date' => $readingsDate,
//             'old_meter_reading' => $previousReading,
//             'new_meter_reading' => $currentReading,
//             'amount_used' => $consumption,
//             'cost' => $cost
//         ]);
        
//         // Collect details for response
//         $utilityDetails[] = [
//             'utility_type_id' => $utilityId,
//             'utility_type' => $utilityType,
//             'previous_reading' => $previousReading,
//             'current_reading' => $currentReading,
//             'consumption' => $consumption,
//             'rate' => $rate,
//             'cost' => $cost,
//             'previous_reading_date' => isset($previousReadings[$utilityId]) ? 
//                 $previousReadings[$utilityId]['date'] : null
//         ];
//     }
    
//     return [$totalCost, $utilityDetails];
// }


    private function calculateUtilityCost($roomId, $newReadings, $readingsDate)
    {
        $totalUtilityCost = 0;

        foreach ($newReadings as $utilityName => $newReading) {
            // Find the utility
            $utility = Utility::where('utility_name', $utilityName)->first();
            if (!$utility) continue;

            // Get latest previous reading
            $previousReading = UtilityUsage::where('room_id', $roomId)
                ->where('utility_id', $utility->utility_id)
                ->orderBy('created_at', 'desc')
                ->first();

            $oldReading = $previousReading ? $previousReading->new_meter_reading : 0;
            $consumption = $newReading - $oldReading;

            // Get current utility price
            $currentPrice = UtilityPrice::where('utility_id', $utility->utility_id)
                ->where('effective_date', '<=', $readingsDate)
                ->orderBy('effective_date', 'desc')
                ->first();

            // Calculate utility cost
            $utilityCost = $consumption * ($currentPrice->price ?? 0);
            $totalUtilityCost += $utilityCost;

            // Save new utility usage
            UtilityUsage::create([
                'room_id' => $roomId,
                'utility_id' => $utility->utility_id,
                'usage_date' => $readingsDate,
                'old_meter_reading' => $oldReading,
                'new_meter_reading' => $newReading,
                'amount_used' => $consumption
            ]);
        }

        return $totalUtilityCost;
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
    private function generateMonthlyInvoice($rental, $utilityCost, $readingsDate, $paymentMethod = 'cash')
    {
        // Calculate total amount due (rent + utilities)
        $room = RoomDetail::findOrFail($rental->room_id);
        $totalAmount = $room->rent_amount + $utilityCost;

        // Set due date to next month
        $dueDate = Carbon::parse($readingsDate)->addMonth();

        return InvoiceDetail::create([
            'rental_id' => $rental->rental_id,
            'amount_due' => $totalAmount,
            'due_date' => $dueDate,
            'paid' => false,
            'payment_method' => $paymentMethod, // Use provided or default payment method
            'payment_status' => 'pending'
        ]);
    }
}
