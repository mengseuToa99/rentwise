"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RootLayout from "@/components/layout";
import { propertyService } from "@/services/api/properties";
import { Room } from "@/services/api/types/property";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import UnitForm from "@/components/UnitForm";

const unitSchema = z.object({
  units: z.array(z.object({
    unitNumber: z.number().min(1, "Unit number is required"),
    unitDescription: z.string().min(1, "Description is required"),
    roomType: z.string().min(1, "Room type is required"),
    unitPrice: z.string().min(1, "Price is required"),
    available: z.boolean(),
    roomDueDate: z.date(),
    utilityReadings: z.array(
      z.object({
        utility_name: z.string(),
        reading: z.string().min(1, "Reading is required"),
      })
    ),
  }))
});

const EditUnit: React.FC = () => {
  const { propertyId, roomId } = useParams<{ 
    propertyId: string;
    roomId: string 
  }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [utilities, setUtilities] = useState<Array<{ utility_name: string; isDefault?: boolean }>>([]);

  const form = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      units: [{
        unitNumber: 0,
        unitDescription: "",
        roomType: "",
        unitPrice: "",
        available: true,
        roomDueDate: new Date(),
        utilityReadings: [],
      }]
    }
  });

  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        setLoading(true);
        
        if (!propertyId || !roomId) {
          throw new Error("Missing property or unit ID in URL");
        }

        const storedUser = localStorage.getItem("user");
        if (!storedUser) throw new Error("User not logged in");
        const user = JSON.parse(storedUser);
        const landlordId = user.user_id || user.id;

        const response = await propertyService.getProperties(Number(landlordId));
        const allProperties = Array.isArray(response) ? response : response.properties;
        
        const property = allProperties.find(
          p => p.property_id?.toString() === propertyId
        );

        if (!property) throw new Error("Property not found");

        const unit = property.rooms?.find(r => r.room_id?.toString() === roomId);
        if (!unit) throw new Error("Unit not found");

        setUtilities(property.utilities.map(u => ({
          utility_name: u.utility_name,
          isDefault: ["Water", "Electricity"].includes(u.utility_name)
        })));

        const formData = {
          units: [{
            unitNumber: unit.room_number,
            unitDescription: unit.description || "",
            roomType: unit.room_type || "",
            unitPrice: unit.rent_amount.toString(),
            available: unit.available === 1,
            roomDueDate: unit.due_date ? new Date(unit.due_date) : new Date(),
            utilityReadings: unit.utility_readings?.map(ur => ({
              utility_name: ur.utility_name,
              reading: ur.reading.toString()
            })) || []
          }]
        };

        form.reset(formData);

      } catch (error) {
        console.error("Error fetching unit data:", error);
        toast.error(error.message);
        navigate("/property");
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [propertyId, roomId, form, navigate]);

  const onSubmit = async (data: any) => {
    try {
      const transformedData = {
        room_id: Number(roomId),
        property_id: Number(propertyId),
        room_number: data.units[0].unitNumber,
        description: data.units[0].unitDescription,
        room_type: data.units[0].roomType,
        rent_amount: Number(data.units[0].unitPrice),
        available: data.units[0].available ? 1 : 0,
        due_date: data.units[0].roomDueDate.toISOString(),
        utility_readings: data.units[0].utilityReadings.map((ur: any) => ({
          utility_name: ur.utility_name,
          reading: Number(ur.reading)
        }))
      };

      await propertyService.updateRoom(transformedData);
      toast.success("Unit updated successfully");
      setTimeout(() => navigate("/property"), 2000);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update unit");
    }
  };

  if (loading) {
    return (
      <RootLayout>
        <div className="p-8">Loading unit data...</div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Unit</h1>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <UnitForm
              index={0}
              remove={() => {}}
              utilities={utilities}
            />
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/property")}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </RootLayout>
  );
};

export default EditUnit;