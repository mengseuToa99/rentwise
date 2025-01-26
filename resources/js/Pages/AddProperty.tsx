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
import UnitForm from "../components/UnitForm"; // Import the UnitForm component

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
            unitPhoto: z.string().min(1, { message: "Unit photo is required." }),
            unitNumber: z.string().min(1, { message: "Unit Number is required." }),
            unitDescrption: z.string().min(1, { message: "Unit Descrption is required." }),
            meterReading: z.string().min(1, { message: "meterReading is required." }),
            unitPrice: z.string().min(1, { message: "Unit Price is required." }),
        })
    ),
});

const AddProperty: React.FC = () => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUnitsVisible, setIsUnitsVisible] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            propertyPhoto: undefined,
            propertyName: "",
            description: "",
            address: "",
            units: [{
                unitPhoto: undefined,
                unitNumber: "",
                unitDescrption: "",
                meterReading: "",
                unitPrice: ""
            }],
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

    return (
        <RootLayout>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Add Property</h1>

                <div className="border p-8 rounded-lg shadow-md">
                    <FormProvider {...form}> {/* Wrap the form with FormProvider */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="flex">
                                <FormField
                                    control={form.control}
                                    name="propertyPhoto"
                                    render={() => (
                                        <FormItem className="w-1/3">
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
                                                        className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 bg-gray-100 border border-dashed rounded-lg shadow-md hover:bg-gray-200"
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
                                                    <span className=" text-sm text-gray-600">
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
                                    <div className="flex flex-row space-x-4">
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

                            <div className="flex items-center w-full space-x-2 mb-6">
                                <Button type="button" onClick={() => append({ unitPhoto: "", unitNumber: "", unitDescrption: "", meterReading: "", unitPrice: "" })}>
                                    Add Unit
                                </Button>
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
                                <div className="space-y-4">
                                    {fields.map((item, index) => (
                                        <UnitForm
                                            key={item.id}
                                            index={index}
                                            remove={remove}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end mt-6">
                                <Button type="submit">Submit</Button>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </RootLayout >
    );
};

export default AddProperty;