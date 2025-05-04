"use client";

import React, { useState, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronsUpDown, MoreVertical, Calendar, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { propertyService } from "@/services/api/properties";
import { toast } from "sonner";
import { PropertyFormData, Room, TenantAssignment } from "@/services/api/types/property";

const PropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<PropertyFormData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantAssignData, setTenantAssignData] = useState({
    userId: "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)), // Default to 12 months lease
    propertyId: 0,
    roomId: 0,
    leaseFile: undefined as File | undefined  // Changed from File | null to File | undefined
  });
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
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
        // Instead of throwing an error, set properties to empty array
        setProperties([]);
      }
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      // Don't set the error, just set properties to empty array
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDeleteProperty = async (propertyId: number) => {
    const propertyIndex = properties.findIndex(p => p.property_id === propertyId);
    if (propertyIndex === -1) return;

    const propertyToDelete = properties[propertyIndex];
    const originalProperties = [...properties];

    // Optimistic update
    setProperties(prev => prev.filter(p => p.property_id !== propertyId));

    toast.custom((t) => (
      <div className="flex items-center w-full max-w-sm gap-4 p-4 text-sm border rounded-lg bg-background">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Property deleted</span>
            <span className="text-muted-foreground">
              {propertyToDelete.property_name}
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
            setProperties(prev => [
              ...prev.slice(0, propertyIndex),
              propertyToDelete,
              ...prev.slice(propertyIndex)
            ]);
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
    const propertyIndex = properties.findIndex(p => p.property_id === propertyId);
    if (propertyIndex === -1) return;

    const roomIndex = properties[propertyIndex].rooms.findIndex(r => r.room_id === roomId);
    if (roomIndex === -1) return;

    // Create deep copy for restoration
    const originalProperties = JSON.parse(JSON.stringify(properties));
    const roomToDelete = originalProperties[propertyIndex].rooms[roomIndex];

    // Optimistic update
    setProperties(prev => prev.map(p => 
      p.property_id === propertyId ? {
        ...p,
        rooms: p.rooms.filter(r => r.room_id !== roomId)
      } : p
    ));

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
            setProperties(prev => prev.map(p => 
              p.property_id === propertyId ? {
                ...p,
                rooms: [
                  ...p.rooms.slice(0, roomIndex),
                  roomToDelete,
                  ...p.rooms.slice(roomIndex)
                ]
              } : p
            ));
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
  
  const handleOpenAssignTenant = (propertyId: number, roomId: number) => {
    // Find the property and room
    const property = properties.find(p => p.property_id === propertyId);
    const room = property?.rooms.find(r => r.room_id === roomId);
    
    // Check if we're updating an existing tenant or assigning a new one
    const isNewAssignment = room?.available === 1;
    
    // If updating, we might want to pre-fill with existing tenant data
    // This would require an additional API call to get tenant details
    // For now, we'll just set empty values and let the user fill them in
    
    setTenantAssignData({
      ...tenantAssignData,
      propertyId,
      roomId,
      userId: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      leaseFile: undefined
    });
    
    // You could add code here to fetch existing tenant info if it's an update
    
    setIsAssignDialogOpen(true);
  };
  
  const handleAssignTenant = async () => {
    try {
      // Validate the form data
      if (!tenantAssignData.userId) {
        toast.error("Please enter a tenant user ID");
        return;
      }
      
      if (tenantAssignData.startDate >= tenantAssignData.endDate) {
        toast.error("End date must be after start date");
        return;
      }
      
      // Call API to assign tenant to unit
      // This is a placeholder - you'll need to implement the actual API call
      await propertyService.assignTenant({
        propertyId: tenantAssignData.propertyId,
        roomId: tenantAssignData.roomId,
        tenantId: parseInt(tenantAssignData.userId),
        startDate: tenantAssignData.startDate,
        endDate: tenantAssignData.endDate,
        leaseAgreement: tenantAssignData.leaseFile
      });
      
      // Update local state to mark unit as occupied
      setProperties(prev => prev.map(property => 
        property.property_id === tenantAssignData.propertyId 
          ? {
              ...property,
              rooms: property.rooms.map(room => 
                room.room_id === tenantAssignData.roomId
                  ? { ...room, available: false }
                  : room
              )
            }
          : property
      ));
      
      toast.success("Tenant assigned successfully");
      setIsAssignDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to assign tenant:", error);
      toast.error("Failed to assign tenant: " + error.message);
    }
  };

  // Render main content including header and action buttons
  const renderMainContent = () => {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Property Management</h1>

        <div className="flex items-center justify-between mb-6">
          <Input placeholder="Search properties..." className="max-w-sm" />
          <a href={`${window.location.pathname}/${addPropertyUrl}`} className="flex items-center">
            <Button variant="default">Add New Property</Button>
          </a>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-4 text-gray-500">Loading your properties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4">Property not found</h3>
            <a href={`${window.location.pathname}/${addPropertyUrl}`}>
              <Button className="inline-flex items-center mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </a>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-xl font-medium mb-2">Property not found</h3>
            <a href={`${window.location.pathname}/${addPropertyUrl}`}>
              <Button className="inline-flex items-center mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </a>
          </div>
        ) : (
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
                          <DropdownMenuItem asChild>
                            <a
                              href={`${window.location.pathname}/editProperty/${property.property_id}`}
                              className="w-full cursor-pointer"
                            >
                              Edit Property
                            </a>
                          </DropdownMenuItem>
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
                                    <DropdownMenuItem asChild>
                                      <a
                                        href={`${window.location.pathname}/editUnit/${property.property_id}/${unit.room_id}`}
                                        className="w-full cursor-pointer"
                                      >
                                        Edit Unit
                                      </a>
                                    </DropdownMenuItem>
                                    {unit.available === 1 ? (
                                      <DropdownMenuItem
                                        onSelect={() => handleOpenAssignTenant(property.property_id, unit.room_id)}
                                      >
                                        Assign Tenant
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onSelect={() => handleOpenAssignTenant(property.property_id, unit.room_id)}
                                      >
                                        Update Tenant Info
                                      </DropdownMenuItem>
                                    )}
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
        )}
        
        {/* Tenant Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Tenant to Unit</DialogTitle>
              <DialogDescription>
                Enter tenant details and lease period to assign them to this unit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenantId" className="text-right">
                  Tenant ID
                </Label>
                <Input
                  id="tenantId"
                  value={tenantAssignData.userId}
                  onChange={(e) => setTenantAssignData({...tenantAssignData, userId: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {tenantAssignData.startDate ? (
                          format(tenantAssignData.startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={tenantAssignData.startDate}
                        onSelect={(date) => date && setTenantAssignData({...tenantAssignData, startDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {tenantAssignData.endDate ? (
                          format(tenantAssignData.endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={tenantAssignData.endDate}
                        onSelect={(date) => date && setTenantAssignData({...tenantAssignData, endDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leaseAgreement" className="text-right">
                  Lease Document
                </Label>
                <div className="col-span-3">
                  <Input
                    id="leaseAgreement"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        setTenantAssignData({...tenantAssignData, leaseFile: files[0]});
                      } else {
                        setTenantAssignData({...tenantAssignData, leaseFile: undefined});
                      }
                    }}
                    className="col-span-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: Upload lease agreement document (PDF, DOC, DOCX)
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignTenant}>
                {tenantAssignData.propertyId && 
                 properties.find(p => p.property_id === tenantAssignData.propertyId)?.
                 rooms.find(r => r.room_id === tenantAssignData.roomId)?.available === 1 
                  ? "Assign Tenant" 
                  : "Update Tenant"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Main render return
  return (
    <RootLayout>
      {renderMainContent()}
    </RootLayout>
  );
};

export default PropertyManagement;