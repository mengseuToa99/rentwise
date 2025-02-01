"use client";

import React, { useState } from "react";
import RootLayout from "@/components/layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Camera, ChevronDown, ChevronUp } from "lucide-react";
import UnitForm from "../components/UnitForm";
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
} from "@/components/ui/dialog"; // Use Dialog for a centered modal

// Define the form schema with Zod
const formSchema = z.object({
    propertyPhoto: z
        .any()
        .refine((file) => file instanceof File, { message: "Please upload a valid file." }),
    propertyName: z.string().min(1, { message: "Property name is required." }),
    description: z.string().min(1, { message: "Description is required." }),
    address: z.string().min(1, { message: "Address is required." }),
    units: z.array(
        z.object({
            unitPhoto: z
                .any()
                .refine((file) => file instanceof File, { message: "Please upload a valid file." }),
            unitNumber: z.string().min(1, { message: "Unit Number is required." }),
            unitDescrption: z.string().min(1, { message: "Unit Description is required." }),
            meterReading: z.string().min(1, { message: "Meter Reading is required." }),
            unitPrice: z.string().min(1, { message: "Unit Price is required." }),
            floor: z.number().min(1, { message: "Floor is required." }), // Add floor field
        })
    ),
});

const AddProperty: React.FC = () => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUnitsVisible, setIsUnitsVisible] = useState(true);
    const [floors, setFloors] = useState<number>(0);
    const [roomsPerFloor, setRoomsPerFloor] = useState<number[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control the dialog

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            propertyPhoto: undefined,
            propertyName: "",
            description: "",
            address: "",
            units: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "units",
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    // File change handler for property photo
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("propertyPhoto", file);
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Handle adding units based on floors and rooms
    const handleAddUnits = (floors: number, roomsPerFloor: number[]) => {
        for (let floor = 1; floor <= floors; floor++) {
            for (let room = 1; room <= roomsPerFloor[floor - 1]; room++) {
                append({
                    unitPhoto: undefined,
                    unitNumber: `Room ${room}`,
                    unitDescrption: "",
                    meterReading: "",
                    unitPrice: "",
                    floor: floor, // Add floor number
                });
            }
        }
        setIsDialogOpen(false); // Close the dialog after generating units
    };

    // Group units by floor
    const groupedUnits = fields.reduce((acc, unit) => {
        const floor = unit.floor;
        if (!acc[floor]) {
            acc[floor] = [];
        }
        acc[floor].push(unit);
        return acc;
    }, {} as Record<number, typeof fields>);

    return (
        <RootLayout>
            <div className="p-4 sm:p-8">
                <h1 className="text-3xl font-bold mb-6">Add Property</h1>

                <div className="border p-4 sm:p-8 rounded-lg">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Property Photo, Name, Description, and Address fields */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <FormField
                                    control={form.control}
                                    name="propertyPhoto"
                                    render={() => (
                                        <FormItem className="w-full sm:w-1/3">
                                            <FormLabel>Upload Photo Of Your Property</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-col items-start space-y-3">
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
                                </div>
                            </div>

                            {/* Units Section */}
                            <div className="flex items-center w-full space-x-2 mb-6 sticky top-0 border-black dark:border-white z-10 max-w-full">
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button">
                                            Add Unit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl p-4">
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
                                                            const newRoomsPerFloor = [...roomsPerFloor];
                                                            newRoomsPerFloor[floorIndex] = Number(e.target.value);
                                                            setRoomsPerFloor(newRoomsPerFloor);
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
                                <hr className="flex-grow border-t-4 border-black dark:border-white" />
                                <div
                                    className="cursor-pointer"
                                    onClick={() => setIsUnitsVisible((prev) => !prev)}
                                >
                                    {isUnitsVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Collapsible section for units */}
                            {isUnitsVisible && (
                                <>
                                    {/* Grid layout for larger screens */}
                                    <div className="hidden md:grid grid-cols-1 gap-4 max-w-full">
                                        {Object.entries(groupedUnits).map(([floor, units]) => (
                                            <div key={floor} className="space-y-4">
                                                <h3 className="text-xl font-bold">Floor {floor}</h3>
                                                {units.map((unit, index) => (
                                                    <div key={unit.id} className="w-full">
                                                        <UnitForm
                                                            index={fields.findIndex((f) => f.id === unit.id)}
                                                            remove={remove}
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
                                                            {units.map((unit, index) => (
                                                                <div key={unit.id} className="w-full">
                                                                    <UnitForm
                                                                        index={fields.findIndex((f) => f.id === unit.id)}
                                                                        remove={remove}
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
