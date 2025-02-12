"use client";

import React, { useState, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronsUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { propertyService } from "@/services/api/properties";
import { toast } from "sonner";
import { PropertyFormData, Room } from "@/services/api/types/property";

const PropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<PropertyFormData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const addPropertyUrl = "addProperty";

  const fetchProperties = async () => {
    try {
      // Retrieve the stored user data from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User not logged in");
      }
      const user = JSON.parse(storedUser);
      // Extract landlordId from user data (using user_id or id)
      const landlordId = user.user_id ? Number(user.user_id) : Number(user.id);
      if (!landlordId) {
        throw new Error("Landlord ID not found");
      }
      
      const response = await propertyService.getProperties(landlordId);
      console.log("API response data:", response);
      
      // Ensure response format is correct
      if (response && Array.isArray(response.properties)) {
        setProperties(response.properties);
      } else if (Array.isArray(response)) {
        setProperties(response);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      setError(error.message);
      toast.error("Failed to fetch properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <RootLayout>
        <div className="p-8">
          <p>Loading properties...</p>
        </div>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <RootLayout>
        <div className="p-8">
          <p>Error loading properties: {error}</p>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Property Management</h1>

        {/* Search and Add Property */}
        <div className="flex items-center justify-between mb-6">
          <Input placeholder="Search properties..." className="max-w-sm" />
          <a href={`${window.location.pathname}/${addPropertyUrl}`} className="flex items-center">
            <Button variant="default">Add New Property</Button>
          </a>
        </div>

        {/* Render each Property Card */}
        <div className="space-y-8">
          {properties.map((property) => {
            // Compute property status based on its rooms' availability.
            // (Assume that if at least one room is available (true), the property is "Vacant")
            const availableRooms = property.rooms.filter((room) => room.available);
            const propertyStatus = availableRooms.length > 0 ? "Vacant" : "Occupied";

            return (
              <Card key={property.property_id} className="border p-6 rounded-lg shadow-sm dark:border-gray-700">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start">
                  {/* Property Details */}
                  <div className="mb-4 md:mb-0">
                    <CardTitle className="text-lg font-semibold dark:text-white">
                      {property.property_name}
                    </CardTitle>
                    <CardDescription className="flex items-center text-gray-500 dark:text-gray-400">
                      <MapPin size={16} className="mr-1" />
                      {property.address}, {property.location}
                    </CardDescription>
                  </div>
                  {/* Property Status */}
                  <div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                      {propertyStatus}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Property Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {property.description}
                  </p>

                  {/* Update Button for the Property */}
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>

                  {/* Collapsible Unit Section */}
                  <Collapsible>
                    <div className="flex items-center justify-between">
                      <Separator className="flex-1 dark:bg-gray-700" />
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="ml-4">
                          <ChevronsUpDown className="h-4 w-4 transition-transform duration-200 [data-state=open]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="mt-4 ml-12 space-y-4">
                        {property.rooms.map((unit: Room) => (
                          <div
                            key={unit.room_id}
                            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start"
                          >
                            <div>
                              <p className="text-sm font-medium dark:text-white">
                                Room #{unit.room_number} 
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Price: ${unit.rent_amount}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {unit.description}
                              </p>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col items-end">
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded ${
                                  unit.available
                                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                                    : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                }`}
                              >
                                {unit.available ? "Vacant" : "Occupied"}
                              </span>
                              <div className="flex space-x-2 mt-2">
                                <Button variant="outline" size="sm">
                                  Move In
                                </Button>
                                <Button variant="outline" size="sm">
                                  Update
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </RootLayout>
  );
};

export default PropertyManagement;
