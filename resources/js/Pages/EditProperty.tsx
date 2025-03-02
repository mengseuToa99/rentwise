"use client";

import React, { useEffect, useState } from "react";
import RootLayout from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { propertyService } from "@/services/api/properties";
import { PropertyFormData } from "@/services/api/types/property";
import { Trash } from "lucide-react";

// Utility schema remains the same
const utilitySchema = z.object({
  utility_name: z.string().min(1, "Utility name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  isDefault: z.boolean().default(false),
});

// Remove the units/rooms schema and field from the form schema
const formSchema = z.object({
  propertyName: z.string().min(1, { message: "Property name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  address: z.string().min(1, { message: "Address is required." }),
  location: z.string().min(1, { message: "Location is required." }),
  utilities: z.array(utilitySchema).min(2, "Default utilities are required"),
});

const EditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fetchedProperty, setFetchedProperty] = useState<PropertyFormData | null>(null);
  const [isUtilityDialogOpen, setIsUtilityDialogOpen] = useState(false);

  // Initialize the form with default values (units removed)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyName: "",
      description: "",
      address: "",
      location: "",
      utilities: [
        { utility_name: "Water", description: "Water utility", price: "", isDefault: true },
        { utility_name: "Electricity", description: "Electricity utility", price: "", isDefault: true },
      ],
    },
  });

  const { fields: utilityFields, append: appendUtility, remove: removeUtility } = useFieldArray({
    control: form.control,
    name: "utilities",
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getProperty(Number(id));
        console.log("Fetched property data:", data);
        // Adjust if your API wraps the property in a "property" key
        const propertyData: PropertyFormData = data.property || data;
        setFetchedProperty(propertyData);

        form.reset({
          propertyName: propertyData.property_name,
          description: propertyData.description,
          address: propertyData.address,
          location: propertyData.location,
          utilities: propertyData.utilities
            ? propertyData.utilities.map((u) => ({
                utility_name: u.utility_name,
                description: u.description,
                price: u.price.toString(),
                isDefault: u.isDefault,
              }))
            : [
                { utility_name: "Water", description: "Water utility", price: "", isDefault: true },
                { utility_name: "Electricity", description: "Electricity utility", price: "", isDefault: true },
              ],
        });
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error("Failed to load property");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <RootLayout>
        <div className="p-8">
          <p>Loading property...</p>
        </div>
      </RootLayout>
    );
  }

  if (!fetchedProperty) {
    return (
      <RootLayout>
        <div className="p-8">
          <p>Property not found.</p>
        </div>
      </RootLayout>
    );
  }

  // Submission handler: update property without units/rooms
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload: PropertyFormData = {
        property_id: fetchedProperty.property_id,
        property_name: values.propertyName,
        address: values.address,
        location: values.location,
        description: values.description,
        utilities: values.utilities.map((utility) => ({
          utility_name: utility.utility_name,
          description: utility.description,
          price: parseFloat(utility.price),
          isDefault: utility.isDefault,
        })),
      };

      await propertyService.updateProperty(payload.property_id, payload);
      toast.success("Property updated successfully!");
      navigate(-1);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update property.";
      toast.error(errorMessage);
    }
  };

  return (
    <RootLayout>
      <div className="p-4 sm:p-8">
        <h1 className="text-3xl font-bold mb-6">Edit Property</h1>
        <div className="border p-4 sm:p-8 rounded-lg">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="propertyName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Property Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Property Name" {...field} />
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
                          <Input placeholder="Property Description" {...field} />
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

                {/* Utilities Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      {utilityFields.map((field, index) =>
                        field.isDefault ? (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={`utilities.${index}.price`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>{field.utility_name} Price</FormLabel>
                                <FormControl>
                                  <Input
                                    {...formField}
                                    type="number"
                                    placeholder={`${field.utility_name} Price`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : null
                      )}
                    </div>
                    <div className="self-end">
                      <Dialog open={isUtilityDialogOpen} onOpenChange={setIsUtilityDialogOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" className="whitespace-nowrap">
                            Add Additional Utilities
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Additional Utilities</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {utilityFields.map((field, index) =>
                              !field.isDefault ? (
                                <div key={field.id} className="flex gap-4 items-center">
                                  <div className="flex-1 space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`utilities.${index}.utility_name`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input placeholder="Utility Name" {...field} autoFocus />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <FormField
                                      control={form.control}
                                      name={`utilities.${index}.price`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input placeholder="Price" {...field} type="number" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <Button
                                    variant="destructive"
                                    onClick={() => removeUtility(index)}
                                    className="mt-2"
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </div>
                              ) : null
                            )}
                            <Button
                              type="button"
                              onClick={() =>
                                appendUtility({
                                  utility_name: "",
                                  description: "Additional utility",
                                  price: "",
                                  isDefault: false,
                                })
                              }
                              className="w-full"
                            >
                              Add New Utility
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  {form.formState.errors.utilities && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.utilities.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button type="submit">Update Property</Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </RootLayout>
  );
};

export default EditProperty;
