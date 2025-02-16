"use client";

import React, { useState, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronsUpDown, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("User not logged in");
      
      const user = JSON.parse(storedUser);
      const landlordId = user.user_id ? Number(user.user_id) : Number(user.id);
      if (!landlordId) throw new Error("Landlord ID not found");

      const response = await propertyService.getProperties(landlordId);
      
      if (Array.isArray(response)) {
        setProperties(response);
      } else if (response?.properties) {
        setProperties(response.properties);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      setError(error.message);
      toast.error("Failed to fetch properties: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDeleteProperty = async (propertyId: number) => {
    const originalProperties = [...properties];
    const property = properties.find(p => p.property_id === propertyId);
    
    // Optimistic update
    setProperties(prev => prev.filter(p => p.property_id !== propertyId));

    toast.custom((t) => (
      <div className="flex items-center w-full max-w-sm gap-4 p-4 text-sm border rounded-lg bg-background">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Property deleted</span>
            {property && (
              <span className="text-muted-foreground">
                {property.property_name}
              </span>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            This action can be undone within 5 seconds
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => {
            setProperties(originalProperties);
            toast.dismiss(t);
          }}
        >
          Undo
        </Button>
      </div>
    ), {
      duration: 5000,
      onAutoClose: () => {
        performActualPropertyDeletion(propertyId, originalProperties);
      },
    });
  };

  const performActualPropertyDeletion = async (propertyId: number, originalProperties: PropertyFormData[]) => {
    try {
      await propertyService.deleteProperty(propertyId);
    } catch (error) {
      console.error("Property deletion failed:", error);
      setProperties(originalProperties);
      toast.error("Failed to permanently delete property");
    }
  };

  const handleDeleteUnit = async (propertyId: number, roomId: number) => {
    const originalProperties = [...properties];
    const property = properties.find(p => p.property_id === propertyId);
    const roomToDelete = property?.rooms.find(r => r.room_id === roomId);

    if (!property || !roomToDelete) return;

    // Optimistic update
    setProperties(prev => prev.map(p => ({
      ...p,
      rooms: p.rooms.filter(r => r.room_id !== roomId)
    })));

    toast.custom((t) => (
      <div className="flex items-center w-full max-w-sm gap-4 p-4 text-sm border rounded-lg bg-background">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Unit deleted</span>
            <span className="text-muted-foreground">
              Room #{roomToDelete.room_number}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">
            This action can be undone within 5 seconds
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => {
            setProperties(originalProperties);
            toast.dismiss(t);
          }}
        >
          Undo
        </Button>
      </div>
    ), {
      duration: 5000,
      onAutoClose: () => {
        performActualUnitDeletion(propertyId, roomToDelete, originalProperties);
      },
    });
  };

  const performActualUnitDeletion = async (
    propertyId: number,
    room: Room,
    originalProperties: PropertyFormData[]
  ) => {
    try {
      await propertyService.deleteRoom({
        propertyId,
        floorNumber: room.floor_number,
        roomNumber: room.room_number
      });
    } catch (error) {
      console.error("Unit deletion failed:", error);
      setProperties(originalProperties);
      toast.error("Failed to permanently delete unit");
    }
  };

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
          <p className="text-red-500">Error loading properties: {error}</p>
          <Button onClick={fetchProperties} className="mt-4">
            Retry
          </Button>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Property Management</h1>

        <div className="flex items-center justify-between mb-6">
          <Input placeholder="Search properties..." className="max-w-sm" />
          <a href={`${window.location.pathname}/${addPropertyUrl}`} className="flex items-center">
            <Button variant="default">Add New Property</Button>
          </a>
        </div>

        <div className="space-y-8">
          {properties.map((property) => {
            const availableRooms = property.rooms?.filter((room) => room.available) || [];
            const propertyStatus = availableRooms.length > 0 ? "Vacant" : "Occupied";

            return (
              <Card key={property.property_id} className="border p-6 rounded-lg shadow-sm dark:border-gray-700">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start">
                  <div className="mb-4 md:mb-0">
                    <CardTitle className="text-lg font-semibold dark:text-white">
                      {property.property_name}
                    </CardTitle>
                    <CardDescription className="flex items-center text-gray-500 dark:text-gray-400">
                      <MapPin size={16} className="mr-1" />
                      {property.address}, {property.location}
                    </CardDescription>
                  </div>
                  <div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                      {propertyStatus}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {property.description}
                  </p>

                  <div className="flex justify-end mb-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          onSelect={() => handleDeleteProperty(property.property_id)}
                        >
                          Delete Property
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

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
                        {(property.rooms || []).map((unit: Room) => (
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
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="mt-2">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem 
                                    onSelect={() => handleDeleteUnit(property.property_id, unit.room_id)}
                                  >
                                    Delete Unit
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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