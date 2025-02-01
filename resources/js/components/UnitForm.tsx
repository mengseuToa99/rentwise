import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Camera, Trash } from "lucide-react";

interface UnitFormProps {
    index: number;
    remove: (index: number) => void;
}

const UnitForm: React.FC<UnitFormProps> = ({ index, remove }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const { control, setValue } = useFormContext(); // Use the form context from parent

    const handleUnitFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));
            setValue(`units[${index}].unitPhoto`, file); // Update form state
        }
    };

    return (
        <div className="p-4 border rounded-lg w-full">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* File Input for Unit Photo */}
                <FormField
                    control={control}
                    name={`units[${index}].unitPhoto`}
                    render={() => (
                        <FormItem className="w-full sm:w-1/3">
                            <FormLabel>Upload Photo Of Your Unit</FormLabel>
                            <FormControl>
                                <div className="flex flex-col items-start space-y-3">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        className="hidden"
                                        id={`unit-photo-input-${index}`}
                                        onChange={(e) => handleUnitFileChange(e, index)}
                                    />
                                    <label
                                        htmlFor={`unit-photo-input-${index}`}
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
                        {/* Unit Number Field */}
                        <FormField
                            control={control}
                            name={`units[${index}].unitNumber`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Unit Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Unit Number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Unit Description Field */}
                        <FormField
                            control={control}
                            name={`units[${index}].unitDescrption`}
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

                    {/* Meter Reading Field */}
                    <FormField
                        control={control}
                        name={`units[${index}].meterReading`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Meter Reading</FormLabel>
                                <FormControl>
                                    <Input placeholder="Unit Meter Reading" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Unit Price Field */}
                    <FormField
                        control={control}
                        name={`units[${index}].unitPrice`}
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

                {/* Remove Unit Button */}
                <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                    className="h-10 self-start sm:self-center"
                >
                    <Trash size={16} />
                </Button>
            </div>
        </div>
    );
};

export default UnitForm;