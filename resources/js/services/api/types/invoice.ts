// resources/js/types/invoice.ts

export interface UtilityReading {
  old_reading: string;
  new_reading: string;
  consumption: string;
  rate: string;
  cost: string;
  usage_date: string;
}

export interface UtilityDetails {
  Water: UtilityReading;
  Electricity: UtilityReading;
  [key: string]: UtilityReading; // For any additional utilities
}

export interface AmountBreakdown {
  rent: string;
  utilities: string;
  other_charges: string;
  total: string;
}

export interface Invoice {
  invoice_id: number;
  invoice_date: string;
  due_date: string;
  billing_month: string;
  amount_due: string;
  paid: number;
  payment_status: string;
  payment_method: string;
  amount_breakdown: AmountBreakdown;
  utility_details: UtilityDetails;
  tenant_name?: string;
  property_name?: string;
  room_number?: string;
}

export interface Room {
  room_id: number;
  room_number: string;
  property_name: string;
  rent_amount: string;
}

export interface Rental {
  rental_id: number;
  room: Room;
  invoices: Invoice[];
}

export interface TenantSummary {
  total_rentals: number;
  total_invoices: number;
  outstanding_amount: string;
}

export interface Tenant {
  tenant_id: number;
  tenant_name: string;
  rentals: Rental[];
  summary: TenantSummary;
}

export interface ResponseData {
  landlord_id: string;
  tenants: Tenant[];
}