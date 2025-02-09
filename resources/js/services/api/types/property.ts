// resources/js/services/api/types/property.ts
export interface PropertyFormData {
    landlord_id: number;
    property_name: string;
    description: string;
    address: string;
    location: string;
    water_price: number;
    electricity_price: number;
    rooms: Room[];
  }
  
  export interface Room {
    floor_number: number;
    room_number: string;
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
    unitNumber: string;
    unitDescrption: string;
    roomType: string;
    unitPrice: string;
    electricityReading: string;
    waterReading: string;
    roomDueDate: Date;
    floor: number;
    available: boolean;
  }