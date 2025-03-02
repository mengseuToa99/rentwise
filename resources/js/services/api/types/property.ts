// Update your PropertyFormData interface
export interface PropertyFormData {
  property_id: number;
  property_name: string;
  address: string;
  location: string;
  description: string;
  utilities: {
    utility_name: string;
    description: string;
    price: number;
    isDefault?: boolean;
  }[];
  rooms: Room[];
}

// Update Room interface to match your API and form handling
export interface Room {
  room_id?: number;
  floor_number: number;
  room_number: number;
  description: string;
  room_type: string;
  rent_amount: number;
  utility_readings: UtilityReading[];
  due_date: string;
  available: boolean;
}

// Add a new interface for utility readings
export interface UtilityReading {
  utility_name: string;
  reading: number;
}

// Keep UnitFormValues for form handling if needed
export interface UnitFormValues {
  unitNumber: number;
  unitDescription: string; // Fixed typo from "unitDescrption"
  roomType: string;
  unitPrice: string;
  floor: number;
  available: boolean;
  roomDueDate: Date;
  utilityReadings: {
    utility_name: string;
    reading: string;
  }[];
}