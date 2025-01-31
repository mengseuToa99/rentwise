import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define the FormFieldConfig interface
interface FormFieldConfig {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    options?: string[];
    onChange?: (value: string) => void;
}

interface ReusableFormProps {
    formSchema: z.ZodObject<any>;
    defaultValues: Record<string, any>;
    onSubmit: (values: any) => void;
    fields: FormFieldConfig[];
    successMessage: string;
}

const ReusableForm: React.FC<ReusableFormProps> = ({
    formSchema,
    defaultValues,
    onSubmit,
    fields,
    successMessage,
}) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const handleSubmit = async (values: any) => {
        try {
            await onSubmit(values);
            form.reset();
        } catch (error) {
            console.error("Form submission error:", error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid gap-4">
                    {fields.map((field) => (
                        <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name}
                            render={({ field: renderField }) => (
                                <FormItem>
                                    <FormLabel>{field.label}</FormLabel>
                                    <FormControl>
                                        {field.type === "select" ? (
                                            <select
                                                {...renderField}
                                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={(e) => {
                                                    renderField.onChange(e.target.value);
                                                    if (field.onChange) {
                                                        field.onChange(e.target.value);
                                                    }
                                                }}
                                            >
                                                {field.options?.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                {...renderField}
                                                className="w-full"
                                            />
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                <Button type="submit" className="w-full mt-6">
                    Submit
                </Button>
            </form>
        </Form>
    );
};

export default ReusableForm;