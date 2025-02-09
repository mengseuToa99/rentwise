"use client";

import React, { useState } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const PropertyManagement: React.FC = () => {
  // Sample property data – replace with real data when available.
  const propertyData = {
    propertyName: "Sunrise Apartments",
    address: "123 Test Street",
    location: "City Center",
    status: "Vacant" as "Vacant" | "Occupied",
  };

  // Sample unit data array for demonstration.
  const units = [
    { roomNumber: 101, price: 500, status: "Vacant" as "Vacant" | "Occupied" },
    { roomNumber: 102, price: 500, status: "Occupied" as "Vacant" | "Occupied" },
    { roomNumber: 201, price: 500, status: "Vacant" as "Vacant" | "Occupied" },
  ];

  // State to toggle the visibility of the units section.
  const [isUnitsVisible, setIsUnitsVisible] = useState(true);
  const url = "addProperty"; // Ensure the route is correct

  return (
    <RootLayout>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Property Management</h1>
          <div className="flex items-center justify-between">
            <Input placeholder="Search properties..." className="max-w-sm" />
            <a href={`${window.location.pathname}/${url}`} className="flex items-center">
              <Button variant="default">Add New Property</Button>
            </a>
          </div>
        </div>

        {/* Property Card */}
        <Card className="shadow mb-8">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                {propertyData.propertyName}
              </CardTitle>
              <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin size={16} className="mr-1" />
                {propertyData.address}, {propertyData.location}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end mt-4 md:mt-0 space-y-2">
              <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                {propertyData.status}
              </span>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              A modern apartment complex with spacious living areas and premium amenities.
            </p>

            <Separator className="my-4 dark:bg-gray-700" />

            {/* Units Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Units</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsUnitsVisible((prev) => !prev)}
              >
                {isUnitsVisible ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>

            {/* Units List */}
            {isUnitsVisible && (
              <div className="space-y-4">
                {units.map((unit, index) => (
                  <Card
                    key={index}
                    className="shadow-sm bg-gray-50 dark:bg-gray-800 p-4"
                  >
                    {/* Unit Card Header: Room number left, status top right */}
                    <CardHeader className="flex justify-between items-start">
                      <div className="text-base font-semibold">
                        Room #{unit.roomNumber}
                      </div>
                      <div className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                        {unit.status}
                      </div>
                    </CardHeader>
                    {/* Unit Card Content */}
                    <CardContent className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Price: ${unit.price}
                      </p>
                    </CardContent>
                    {/* Unit Card Footer with actions */}
                    <CardFooter className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log(`Move in Room ${unit.roomNumber}`)}
                      >
                        Move In
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log(`Update Room ${unit.roomNumber}`)}
                      >
                        Update
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RootLayout>
  );
};

export default PropertyManagement;
