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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { propertyService } from "@/services/api/properties";

const utilitySchema = z.object({
  utility_name: z.string().min(1, "Utility name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  isDefault: z.boolean().default(false),
});

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
  const [fetchedProperty, setFetchedProperty] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Simulated fetch—replace with your actual API call as needed.
        const dummyProperty = {
          property_name: "Sample Property",
          description: "This is a sample property description.",
          address: "123 Sample Street",
          location: "Sample Location",
          utilities: [
            { utility_name: "Water", description: "Water utility", price_unit: "200" },
            { utility_name: "Electricity", description: "Electricity utility", price_unit: "400" },
          ],
        };

        setFetchedProperty(dummyProperty);

        form.reset({
          propertyName: dummyProperty.property_name,
          description: dummyProperty.description,
          address: dummyProperty.address,
          location: dummyProperty.location,
          utilities: dummyProperty.utilities.map((u: any) => ({
            utility_name: u.utility_name,
            description: u.description || "",
            price: u.price_unit ? u.price_unit.toString() : "",
            isDefault: u.utility_name === "Water" || u.utility_name === "Electricity",
          })),
        });
      } catch (error: any) {
        console.error("Error fetching property:", error);
        toast.error("Failed to load property: " + error.message);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate, form]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const transformedData = {
        property_id: parseInt(id!),
        property_name: values.propertyName,
        address: values.address,
        location: values.location,
        description: values.description,
        utilities: values.utilities.map(utility => ({
          utility_name: utility.utility_name,
          description: utility.description,
          price: Number(utility.price),
        })),
      };

      await propertyService.updateProperty(parseInt(id!), transformedData);
      toast.success("Property updated successfully!");
      setTimeout(() => {
        navigate("/property");
      }, 2000);
    } catch (error: any) {
      console.error("Submit error:", error);
      const errorMessage = error.response?.data?.message || "Failed to update property.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
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
                    <Dialog>
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

              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Form"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </RootLayout>
  );
};

export default EditProperty;
