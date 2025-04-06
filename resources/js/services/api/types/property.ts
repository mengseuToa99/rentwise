// Example of what the property types file should export
interface UtilityPrice {
  price_id: number;
  price_amount: string;
  effective_date: string;
}

interface Utility {
  utility_id: number;
  usage_id: number;
  utility_name: string;
  utility_type: string;
  unit_of_measure: string;
  usage_date: string;
  old_meter_reading: string;
  new_meter_reading: string;
  amount_used: string;
  current_price: UtilityPrice;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

interface Room {
  room_id: number;
  property_id: number;
  room_name: string;
  floor_number: number;
  room_number: number;
  due_date: string;
  description: string;
  room_type: string;
  available: number; // This is a number (0 or 1) not a boolean
  rent_amount: string;
  utility_readings?: UtilityReading[];
}

interface UtilityReading {
  utility_id?: number;
  utility_name?: string;
  usage_date?: string;
  old_meter_reading?: number;
  new_meter_reading?: number;
}

interface Property {
  property_id: number;
  property_name: string;
  address: string;
  location: string;
  description: string;
  utilities: Utility[];
  rooms: Room[];
}

interface FormValues {
  unitNumber: number;
  unitDescription: string;
  roomType: string;
  unitPrice: string;
  electricityReading: string;
  waterReading: string;
  roomDueDate: Date | undefined;
  available: boolean;
}

// New interface for the Tenant Assignment
interface TenantAssignment {
  propertyId: number;
  roomId: number;
  tenantId: number;
  startDate: Date;
  endDate: Date;
  leaseAgreement?: File;  // Changed from File | null to File | undefined
}

// API response interfaces
interface TenantAssignmentResponse {
  success: boolean;
  message: string;
  data?: {
    rental_id: number;
    landlord_id: number;
    tenant_id: number;
    room_id: number;
    start_date: string;
    end_date: string;
    lease_agreement?: string;
    created_at: string;
    updated_at: string;
  };
}

interface DeleteRoomParams {
  propertyId: number;
  floorNumber: number;
  roomNumber: number;
}

// New enhanced PropertyFormData interface including all property data
interface PropertyFormData extends Property {
  // Additional fields that might be needed for forms
  landlord_id?: number;
  created_at?: string;
  updated_at?: string;
}

// API response for tenant information
interface TenantInfoResponse {
  status: string;
  data: TenantInfo;
}

// Tenant information interface
interface TenantInfo {
  rental_id: number;
  landlord_id: number;
  tenant_id: number;
  room_id: number;
  start_date: string;
  end_date: string;
  lease_agreement?: string;
  created_at: string;
  updated_at: string;
  tenant?: {
    user_id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export type {
  UtilityPrice,
  Utility,
  Room,
  UtilityReading,
  Property,
  FormValues,
  TenantAssignment,
  TenantAssignmentResponse,
  DeleteRoomParams,
  PropertyFormData,
  TenantInfo,
  TenantInfoResponse
};