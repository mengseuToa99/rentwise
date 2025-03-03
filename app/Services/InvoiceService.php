<?php

namespace App\Services;

use App\Models\InvoiceDetail;
use App\Models\RentalDetail;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RentalService
{
    /**
     * Create a new rental record.
     *
     * @param array $data
     * @return RentalDetail
     */
    public function createRental(array $data): RentalDetail
    {
        return InvoiceDetail::create([
            'landlord_id' => $data['landlord_id'],
            'tenant_id' => $data['tenant_id'],
            'room_id' => $data['room_id'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'] ?? null,
            'lease_agreement' => $data['lease_agreement'] ?? null,
        ]);
    }

    /**
     * Retrieve a rental record by ID.
     *
     * @param int $id
     * @return RentalDetail|null
     */
    public function getInvoiceById(int $id): ?RentalDetail
    {
        return InvoiceDetail::find($id);
    }

    /**
     * Update an existing rental record.
     *
     * @param int $id
     * @param array $data
     * @return RentalDetail|null
     */
    public function updateRental(int $id, array $data): ?RentalDetail
    {
        $rental = RentalDetail::find($id);

        if (!$rental) {
            return null;
        }

        $rental->update([
            'landlord_id' => $data['landlord_id'] ?? $rental->landlord_id,
            'tenant_id' => $data['tenant_id'] ?? $rental->tenant_id,
            'room_id' => $data['room_id'] ?? $rental->room_id,
            'start_date' => $data['start_date'] ?? $rental->start_date,
            'end_date' => $data['end_date'] ?? $rental->end_date,
            'lease_agreement' => $data['lease_agreement'] ?? $rental->lease_agreement,
        ]);

        return $rental;
    }
}