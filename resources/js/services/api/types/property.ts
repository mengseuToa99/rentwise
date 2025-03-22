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
  available: number;
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