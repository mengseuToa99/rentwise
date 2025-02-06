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
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Camera, ChevronDown, ChevronUp, Trash } from "lucide-react";
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

// Define the form schema with Zod
const formSchema = z.object({
    propertyPhoto: z
        .instanceof(File, { message: "Please upload a valid file." })
        .refine((file) => file.size > 0, { message: "File cannot be empty." }),
    propertyName: z.string().min(1, { message: "Property name is required." }),
    description: z.string().min(1, { message: "Description is required." }),
    address: z.string().min(1, { message: "Address is required." }),
    location: z.string().min(1, { message: "Location is required." }),
    water_price: z.string().min(1, { message: "Water Price is required." }),
    electricity_price: z.string().min(1, { message: "Electricity Price is required." }),
    units: z.array(
        z.object({
            unitPhoto: z
                .instanceof(File, { message: "Please upload a valid file." })
                .refine((file) => file.size > 0, { message: "File cannot be empty." }),
            unitNumber: z.string().min(1, { message: "Unit Number is required." }),
            unitDescrption: z.string().min(1, { message: "Unit Description is required." }),
            roomType: z.string().min(1, { message: "Room Type is required." }),
            unitPrice: z.string().min(1, { message: "Unit Price is required." }),
            electricityReading: z.string().min(1, { message: "Electricity Reading is required." }),
            waterReading: z.string().min(1, { message: "Water Reading is required." }),
            roomDueDate: z.date({ required_error: "Room Due Date is required." }),
            floor: z.number().min(1, { message: "Floor is required." }),
        })
    ),
});

const AddProperty: React.FC = () => {
    // File and preview states
    const [fileName, setFileName] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Visibility and numeric states for generating unit fields
    const [isUnitsVisible, setIsUnitsVisible] = useState(true);
    const [floors, setFloors] = useState<number>(0);
    const [roomsPerFloor, setRoomsPerFloor] = useState<number[]>([]);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isRoomTypeDialogOpen, setIsRoomTypeDialogOpen] = useState(false);

    // State for dynamic room type/price entries
    const [roomTypePrices, setRoomTypePrices] = useState<RoomTypePrice[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            propertyPhoto: undefined,
            propertyName: "",
            description: "",
            address: "",
            water_price: "",
            electricity_price: "",
            units: [],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "units",
    });

    // If the room type dialog opens and there is no entry, add a default empty one.
    useEffect(() => {
        if (isRoomTypeDialogOpen && roomTypePrices.length === 0) {
            setRoomTypePrices([{ id: Date.now(), roomType: "", price: "" }]);
        }
    }, [isRoomTypeDialogOpen, roomTypePrices.length]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Form Values:", values);
        console.log("Room Type Price Entries:", roomTypePrices);
    }

    // Handler for file input changes for property photo
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("propertyPhoto", file);
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Handler for generating unit fields. This function merges any existing unit data.
    const handleAddUnits = (floors: number, roomsPerFloor: number[]) => {
        const oldUnits = form.getValues("units") || [];
        const newUnits = [];
        let counter = 0;

        for (let floor = 1; floor <= floors; floor++) {
            const count = roomsPerFloor[floor - 1] || 0;
            for (let room = 1; room <= count; room++) {
                newUnits.push({
                    unitPhoto: oldUnits[counter]?.unitPhoto ?? undefined,
                    unitNumber: `Room ${room}`,
                    unitDescrption: oldUnits[counter]?.unitDescrption ?? "",
                    roomType: oldUnits[counter]?.roomType ?? "",
                    unitPrice: oldUnits[counter]?.unitPrice ?? "",
                    electricityReading: oldUnits[counter]?.electricityReading ?? "",
                    waterReading: oldUnits[counter]?.waterReading ?? "",
                    roomDueDate: oldUnits[counter]?.roomDueDate ?? new Date(),
                    floor: floor,
                });
                counter++;
            }
        }
        replace(newUnits);
        setIsDialogOpen(false);
    };

    // Group units by floor for display (for grid/carousel layouts)
    const groupedUnits = fields.reduce((acc, unit) => {
        const floor = unit.floor;
        if (!acc[floor]) {
            acc[floor] = [];
        }
        acc[floor].push(unit);
        return acc;
    }, {} as Record<number, typeof fields>);

    // Room Type Price Handlers
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
                            {/* Property Photo, Name, Description, and Address Fields */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <FormField
                                    control={form.control}
                                    name="propertyPhoto"
                                    render={() => (
                                        <FormItem className="w-full sm:w-1/3">
                                            <FormLabel>Upload Photo Of Your Property</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col items-center space-y-3">
                                                    <input
                                                        type="file"
                                                        accept="image/png, image/jpeg"
                                                        className="hidden"
                                                        id="photo-input"
                                                        onChange={handleFileChange}
                                                    />
                                                    <label
                                                        htmlFor="photo-input"
                                                        className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 bg-gray-100 border border-dashed rounded-lg hover:bg-gray-200"
                                                    >
                                                        {preview ? (
                                                            <img
                                                                src={preview}
                                                                alt="Preview"
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <Camera size={32} className="text-gray-500" />
                                                        )}
                                                    </label>
                                                    <span className="text-sm text-gray-600">
                                                        {fileName || "No file selected"}
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Please upload a PNG or JPEG photo.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex flex-col w-full space-y-4">
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
                                {/* Horizontal Line with Collapse Toggle */}
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
                                    {/* Grid layout for larger screens */}
                                    <div className="hidden md:grid grid-cols-1 gap-4 max-w-full">
                                        {Object.entries(groupedUnits).map(([floor, units]) => (
                                            <div key={floor} className="space-y-4">
                                                <h3 className="text-xl font-bold">Floor {floor}</h3>
                                                {units.map((unit, idx) => (
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

                                    {/* Carousel layout for smaller screens */}
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
