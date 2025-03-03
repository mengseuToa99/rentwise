<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRentalRequest;
use App\Http\Requests\UpdateRentalRequest;
use App\Models\RentalDetail;
use App\Services\RentalService;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    protected $rentalService;

    public function __construct(RentalService $rentalService)
    {
        $this->rentalService = $rentalService;
    }

    public function destroy($id)
    {
        try {
            $group = RentalDetail::findOrFail($id);
            $group->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Permission group deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete permission group',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Store a newly created rental in storage.
     *
     * @param StoreRentalRequest $request
     * @return JsonResponse
     */
    public function store(StoreRentalRequest $request): JsonResponse
    {
        try {
            $rental = $this->rentalService->createRental($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Rental created successfully',
                'data' => $rental
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create rental',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retrieve a rental record by ID.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $rental = $this->rentalService->getRentalById($id);

            if (!$rental) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Rental not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $rental
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve rental',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing rental record.
     *
     * @param UpdateRentalRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateRentalRequest $request, int $id): JsonResponse
    {
        try {
            $rental = $this->rentalService->updateRental($id, $request->validated());

            if (!$rental) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Rental not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Rental updated successfully',
                'data' => $rental
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update rental',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
