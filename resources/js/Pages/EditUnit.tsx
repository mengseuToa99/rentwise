"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RootLayout from "@/components/layout";
import { CalendarIcon, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { propertyService } from "@/services/api/properties";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

// Define types
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

const EditUnit: React.FC = () => {
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [unitData, setUnitData] = useState<Room | null>(null);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [date, setDate] = useState<Date>(new Date());

  // Initialize form
  const form = useForm<FormValues>({
    defaultValues: {
      unitNumber: 0,
      unitDescription: "",
      roomType: "",
      unitPrice: "",
      electricityReading: "",
      waterReading: "",
      roomDueDate: undefined,
      available: true
    }
  });

  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        setLoading(true);
        
        // Parse property and room IDs from URL
        const propId = parseInt(propertyId || "0", 10);
        const roomIdNumber = parseInt(roomId || "0", 10);
        
        if (isNaN(propId) || isNaN(roomIdNumber) || propId <= 0 || roomIdNumber <= 0) {
          toast.error("Invalid property or room ID");
          navigate("/property");
          return;
        }

        // Fetch properties data
        const response = await propertyService.getProperties(0);
        console.log("API Response:", response);
        
        // Find the specific property by ID
        const property = response.properties.find((p: Property) => p.property_id === propId);
        
        if (!property) {
          toast.error(`Property with ID ${propId} not found`);
          navigate("/property");
          return;
        }

        // Find the specific room within the property
        const room = property.rooms.find((r: Room) => r.room_id === roomIdNumber);
        
        if (!room) {
          toast.error(`Room with ID ${roomIdNumber} not found in property`);
          navigate("/property");
          return;
        }
        
        console.log("Found room:", room);
        
        // Process utilities
        const propertyUtilities = property.utilities || [];
        console.log("Property utilities:", propertyUtilities);
        
        setUnitData(room);
        setUtilities(propertyUtilities);
        
        // Set date from due_date if available
        if (room.due_date) {
          setDate(new Date(room.due_date));
        }
        
        // Initialize form values with all available room data
        form.reset({
          unitNumber: room.room_number,
          unitDescription: room.description || "",
          roomType: room.room_type || "",
          unitPrice: room.rent_amount || "",
          electricityReading: "",
          waterReading: "",
          roomDueDate: room.due_date ? new Date(room.due_date) : undefined,
          available: Boolean(room.available)
        });

        // Initialize electricity and water readings if available
        if (propertyUtilities.length > 0) {
          const electricityUtil = propertyUtilities.find((u: Utility) => 
            u.utility_name.toLowerCase() === "electricity"
          );
          const waterUtil = propertyUtilities.find((u: Utility) => 
            u.utility_name.toLowerCase() === "water"
          );
          
          if (electricityUtil) {
            form.setValue("electricityReading", electricityUtil.new_meter_reading || "");
          }
          
          if (waterUtil) {
            form.setValue("waterReading", waterUtil.new_meter_reading || "");
          }
        }
        
      } catch (error) {
        console.error("Error fetching unit data:", error);
        toast.error("Failed to load unit data");
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [propertyId, roomId, navigate, form]);

  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      form.setValue("roomDueDate", selectedDate);
    }
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      if (!unitData) return;
      
      // Format utility readings
      const utilityReadings = [];
      
      const electricityUtil = utilities.find(u => u.utility_name.toLowerCase() === "electricity");
      const waterUtil = utilities.find(u => u.utility_name.toLowerCase() === "water");
      
      if (electricityUtil && values.electricityReading) {
        utilityReadings.push({
          utility_id: electricityUtil.utility_id,
          usage_date: new Date().toISOString().split('T')[0],
          old_meter_reading: parseFloat(electricityUtil.new_meter_reading) || 0,
          new_meter_reading: parseFloat(values.electricityReading)
        });
      }
      
      if (waterUtil && values.waterReading) {
        utilityReadings.push({
          utility_id: waterUtil.utility_id,
          usage_date: new Date().toISOString().split('T')[0],
          old_meter_reading: parseFloat(waterUtil.new_meter_reading) || 0,
          new_meter_reading: parseFloat(values.waterReading)
        });
      }
      
      // Prepare update data
      const updateData = {
        room_id: unitData.room_id,
        property_id: unitData.property_id,
        room_name: unitData.room_name, // Keep original room name
        floor_number: unitData.floor_number, // Keep original floor number
        room_number: values.unitNumber,
        due_date: values.roomDueDate ? values.roomDueDate.toISOString().split('T')[0] : unitData.due_date.split(' ')[0],
        room_type: values.roomType,
        description: values.unitDescription,
        available: values.available ? 1 : 0,
        rent_amount: parseFloat(values.unitPrice),
        utility_readings: utilityReadings
      };
      
      console.log("Sending update data:", updateData);
      
      // Call API to update unit
      const response = await propertyService.updateUnit(updateData);
      console.log("Update response:", response);
      
      toast.success("Unit updated successfully");
      navigate("/property");
    } catch (error) {
      console.error("Error updating unit:", error);
      toast.error("Failed to update unit");
    }
  };

  if (loading) {
    return (
      <RootLayout>
        <div className="p-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-lg">Loading unit data...</div>
        </div>
      </RootLayout>
    );
  }

  if (!unitData) {
    return (
      <RootLayout>
        <div className="p-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-lg">Unit not found</div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Unit Details</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="relative p-5 border rounded-lg w-full">
              <div className="absolute top-2 right-2 flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Available</span>
                <FormField
                  control={form.control}
                  name="available"
                  render={({ field }) => (
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-5">
                  <FormField
                    control={form.control}
                    name="unitNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Unit Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Unit Number" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitDescription"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Unit Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Unit Description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Room Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Room Type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input placeholder="Unit Price" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <FormField
                    control={form.control}
                    name="electricityReading"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Electricity Reading</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Enter Electricity Reading"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {utilities.find(u => u.utility_name.toLowerCase() === "electricity") && (
                          <div className="text-xs text-gray-500 mt-1">
                            Price: ${utilities.find(u => u.utility_name.toLowerCase() === "electricity")?.current_price.price_amount} per unit
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="waterReading"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Water Reading</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Enter Water Reading"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {utilities.find(u => u.utility_name.toLowerCase() === "water") && (
                          <div className="text-xs text-gray-500 mt-1">
                            Price: ${utilities.find(u => u.utility_name.toLowerCase() === "water")?.current_price.price_amount} per unit
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="roomDueDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Room Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={handleDateChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/property")}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </RootLayout>
  );
};

export default EditUnit;