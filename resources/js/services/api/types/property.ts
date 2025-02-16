// resources/js/services/api/types/property.ts
export interface PropertyFormData {
  property_name: string;
  address: string;
  location: string;
  description: string;
  utilities: {
    utility_name: string;
    description: string;
    price: number;
  }[];
  rooms: {
    floor_number: number;
    room_number: number;
    description: string;
    room_type: string;
    rent_amount: number;
    utility_readings: {
      utility_name: string;
      reading: number;
    }[];
    due_date: string;
    available: boolean;
  }[];
}

export interface Room {
  room_id: number;
  floor_number: number;
  room_number: number;
  description: string;
  room_type: string;
  rent_amount: number;
  electricity_reading: number;
  water_reading: number;
  due_date: string; // ISO date string
  available: boolean;
}

// If you need to match your form's unit structure exactly:
export interface UnitFormValues {
  unitNumber: number;
  unitDescrption: string;
  roomType: string;
  unitPrice: string;
  electricityReading: string;
  waterReading: string;
  roomDueDate: Date;
  floor: number;
  available: boolean;
}