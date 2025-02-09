"use client";

import React, { useEffect, useState } from "react";
import RootLayout from "@/components/layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    FormField,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Trash } from "lucide-react";
import UnitForm, { RoomTypePrice } from "../components/UnitForm";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { propertyService } from "@/services/api/properties";
import { PropertyFormData } from "@/services/api/types/property";

// Define the unit schema (without image) and include an availability field
const unitSchema = z.object({
    unitNumber: z.string().min(1, { message: "Unit Number is required." }),
    unitDescrption: z.string().min(1, { message: "Unit Description is required." }),
    roomType: z.string().min(1, { message: "Room Type is required." }),
    unitPrice: z.string().min(1, { message: "Unit Price is required." }),
    electricityReading: z.string().min(1, { message: "Electricity Reading is required." }),
    waterReading: z.string().min(1, { message: "Water Reading is required." }),
    roomDueDate: z.date({ required_error: "Room Due Date is required." }),
    floor: z.number().min(1, { message: "Floor is required." }),
    available: z.boolean().default(true),
});

// Update the property schema to include the new "location" field
const formSchema = z.object({
    propertyName: z.string().min(1, { message: "Property name is required." }),
    description: z.string().min(1, { message: "Description is required." }),
    address: z.string().min(1, { message: "Address is required." }),
    location: z.string().min(1, { message: "Location is required." }),
    water_price: z.string().min(1, { message: "Water Price is required." }),
    electricity_price: z.string().min(1, { message: "Electricity Price is required." }),
    units: z.array(unitSchema),
});

const AddProperty: React.FC = () => {
    const [isUnitsVisible, setIsUnitsVisible] = useState(true);
    const [floors, setFloors] = useState<number>(0);
    const [roomsPerFloor, setRoomsPerFloor] = useState<number[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isRoomTypeDialogOpen, setIsRoomTypeDialogOpen] = useState(false);
    const [roomTypePrices, setRoomTypePrices] = useState<RoomTypePrice[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            propertyName: "",
            description: "",
            address: "",
            location: "",
            water_price: "",
            electricity_price: "",
            units: [],
        },
    });

    const { fields, remove, replace } = useFieldArray({
        control: form.control,
        name: "units",
    });

    useEffect(() => {
        if (isRoomTypeDialogOpen && roomTypePrices.length === 0) {
            setRoomTypePrices([{ id: Date.now(), roomType: "", price: "" }]);
        }
    }, [isRoomTypeDialogOpen, roomTypePrices.length]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Create payload
        const payload: PropertyFormData = {
          landlord_id: 1, // Replace with a dynamic value if needed
          property_name: values.propertyName,
          address: values.address,
          location: values.location,
          description: values.description,
          water_price: parseFloat(values.water_price),
          electricity_price: parseFloat(values.electricity_price),
          rooms: values.units.map(unit => ({
            floor_number: unit.floor,
            room_number: unit.unitNumber,
            description: unit.unitDescrption,
            room_type: unit.roomType,
            rent_amount: parseFloat(unit.unitPrice),
            electricity_reading: parseFloat(unit.electricityReading),
            water_reading: parseFloat(unit.waterReading),
            due_date: unit.roomDueDate.toISOString().slice(0, 10),
            available: unit.available
          }))
        };

        // Optional: Log payload to check its structure
        console.log("Payload:", JSON.stringify(payload, null, 2));

        try {
            const data = await propertyService.createProperty(payload);
            toast.success("Property created successfully!");
            console.log("API response:", data);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Failed to create property.";
            toast.error(errorMessage);
            console.error("Error submitting property:", error);
        }
    };

    const handleAddUnits = (floors: number, roomsPerFloor: number[]) => {
        const oldUnits = form.getValues("units") || [];
        const newUnits = [];
        
        // Loop through each floor
        for (let floor = 1; floor <= floors; floor++) {
          // Get the number of rooms for this floor; default to 0 if not specified
          const count = roomsPerFloor[floor - 1] || 0;
          
          // Loop through each room on that floor
          for (let room = 1; room <= count; room++) {
            newUnits.push({
              // Generate room number as an integer:
              // For example, floor 1, room 1 => 1 * 100 + 1 = 101
              unitNumber: floor * 100 + room,
              unitDescrption: oldUnits[newUnits.length]?.unitDescrption ?? "",
              roomType: oldUnits[newUnits.length]?.roomType ?? "",
              unitPrice: oldUnits[newUnits.length]?.unitPrice ?? "",
              electricityReading: oldUnits[newUnits.length]?.electricityReading ?? "",
              waterReading: oldUnits[newUnits.length]?.waterReading ?? "",
              roomDueDate: oldUnits[newUnits.length]?.roomDueDate ?? new Date(),
              floor: floor,
              available: oldUnits[newUnits.length]?.available ?? true,
            });
          }
        }
        replace(newUnits);
        setIsDialogOpen(false);
      };
      

    const groupedUnits = fields.reduce((acc, unit) => {
        const floor = unit.floor;
        if (!acc[floor]) {
            acc[floor] = [];
        }
        acc[floor].push(unit);
        return acc;
    }, {} as Record<number, typeof fields>);

    const handleAddRoomTypeRow = () => {
        setRoomTypePrices((prev) => [
            ...prev,
            { id: Date.now(), roomType: "", price: "" },
        ]);
    };

    const handleRoomTypeChange = (id: number, value: string) => {
        setRoomTypePrices((prev) =>
            prev.map((entry) => (entry.id === id ? { ...entry, roomType: value } : entry))
        );
    };

    const handleRoomPriceChange = (id: number, value: string) => {
        setRoomTypePrices((prev) =>
            prev.map((entry) => (entry.id === id ? { ...entry, price: value } : entry))
        );
    };

    const handleRemoveRoomTypeRow = (id: number) => {
        setRoomTypePrices((prev) => prev.filter((entry) => entry.id !== id));
    };

    const handleSaveRoomTypePrices = () => {
        console.log("Room Type Price Entries:", roomTypePrices);
        setIsRoomTypeDialogOpen(false);
    };

    return (
        <RootLayout>
            <div className="p-4 sm:p-8">
                <h1 className="text-3xl font-bold mb-6">Add Property</h1>
                <div className="border p-4 sm:p-8 rounded-lg">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Property Details Fields */}
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="propertyName"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Property Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter Your Property Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter Description Of Your Property" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="water_price"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Water Price</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter Property Water Price" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="electricity_price"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Electricity Price</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter Property Electricity Price" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Address and Location Row */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter Address" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter Location" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Units Section - Buttons Above Horizontal Line */}
                            <div className="flex flex-col mb-6">
                                <div className="flex items-center space-x-2">
                                    {/* Dialog for Adding Units */}
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button type="button">Add Unit</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-xs sm:max-w-md p-4">
                                            <DialogHeader>
                                                <DialogTitle>Add Units</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <label className="block text-sm font-medium">
                                                    Number of Floors
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={floors}
                                                    onChange={(e) => setFloors(Number(e.target.value))}
                                                />
                                                {Array.from({ length: floors }, (_, floorIndex) => (
                                                    <div key={floorIndex} className="space-y-2">
                                                        <label className="block text-sm font-medium">
                                                            Rooms on Floor {floorIndex + 1}
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={roomsPerFloor[floorIndex] || 0}
                                                            onChange={(e) => {
                                                                const newRooms = [...roomsPerFloor];
                                                                newRooms[floorIndex] = Number(e.target.value);
                                                                setRoomsPerFloor(newRooms);
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    onClick={() => handleAddUnits(floors, roomsPerFloor)}
                                                >
                                                    Generate Units
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Dialog for Room Type Price entries */}
                                    <Dialog open={isRoomTypeDialogOpen} onOpenChange={setIsRoomTypeDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button type="button">Room Type Price</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md p-4">
                                            <DialogHeader>
                                                <DialogTitle>Room Type &amp; Price</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                {roomTypePrices.map((entry) => (
                                                    <div key={entry.id} className="flex items-center gap-4">
                                                        <Input
                                                            type="text"
                                                            placeholder="Room Type"
                                                            value={entry.roomType}
                                                            onChange={(e) =>
                                                                handleRoomTypeChange(entry.id, e.target.value)
                                                            }
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            type="text"
                                                            placeholder="Price"
                                                            value={entry.price}
                                                            onChange={(e) =>
                                                                handleRoomPriceChange(entry.id, e.target.value)
                                                            }
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleRemoveRoomTypeRow(entry.id)}
                                                            variant="destructive"
                                                        >
                                                            <Trash size={20} />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-4 pt-4 justify-between">
                                                    <Button type="button" onClick={handleAddRoomTypeRow}>
                                                        Add Another Room Type
                                                    </Button>
                                                    <Button type="button" onClick={handleSaveRoomTypePrices}>
                                                        Save Room Types
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="flex items-center mt-2">
                                    <hr className="flex-grow border-t-4 border-black dark:border-white" />
                                    <div
                                        className="cursor-pointer ml-2"
                                        onClick={() => setIsUnitsVisible((prev) => !prev)}
                                    >
                                        {isUnitsVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {/* Collapsible Section for Units */}
                            {isUnitsVisible && (
                                <>
                                    <div className="hidden md:grid grid-cols-1 gap-4 max-w-full">
                                        {Object.entries(groupedUnits).map(([floor, units]) => (
                                            <div key={floor} className="space-y-4">
                                                <h3 className="text-xl font-bold">Floor {floor}</h3>
                                                {units.map((unit) => (
                                                    <div key={unit.id} className="w-full">
                                                        <UnitForm
                                                            index={fields.findIndex((f) => f.id === unit.id)}
                                                            remove={remove}
                                                            roomTypePrices={roomTypePrices}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="md:hidden w-full">
                                        <Carousel className="w-full">
                                            <CarouselContent className="w-full">
                                                {Object.entries(groupedUnits).map(([floor, units]) => (
                                                    <CarouselItem key={floor} className="w-full">
                                                        <div className="space-y-4">
                                                            <h3 className="text-xl font-bold">Floor {floor}</h3>
                                                            {units.map((unit) => (
                                                                <div key={unit.id} className="w-full">
                                                                    <UnitForm
                                                                        index={fields.findIndex((f) => f.id === unit.id)}
                                                                        remove={remove}
                                                                        roomTypePrices={roomTypePrices}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end mt-6">
                                <Button type="submit">Submit</Button>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </RootLayout>
    );
};

export default AddProperty;
