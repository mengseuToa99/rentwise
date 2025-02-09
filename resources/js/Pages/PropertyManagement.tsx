"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import RootLayout from "@/components/layout";
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

// Sample data: array of properties, each with its own units
const properties = [
  {
    propertyName: "Sunrise Apartments",
    address: "123 Main Street",
    location: "City Center",
    status: "Vacant",
    description:
      "This property offers spacious living areas, modern amenities, and a prime location in the heart of the city. Enjoy comfortable living with easy access to public transportation, shopping, and dining options.",
    units: [
      {
        roomNumber: 101,
        price: 500,
        status: "Vacant",
        description: "Cozy unit with a great view and ample natural light.",
      },
      {
        roomNumber: 102,
        price: 600,
        status: "Occupied",
        description: "Bright and airy unit with modern decor and finishes.",
      },
    ],
  },
  {
    propertyName: "Moonlight Residences",
    address: "456 Elm Street",
    location: "Uptown",
    status: "Occupied",
    description:
      "Modern design with advanced amenities. Enjoy luxury living in a vibrant neighborhood with upscale shopping and fine dining nearby.",
    units: [
      {
        roomNumber: 201,
        price: 750,
        status: "Occupied",
        description: "Spacious unit with a balcony overlooking the city.",
      },
      {
        roomNumber: 202,
        price: 700,
        status: "Vacant",
        description: "Recently renovated unit featuring updated appliances and fixtures.",
      },
      {
        roomNumber: 203,
        price: 720,
        status: "Vacant",
        description: "Comfortable living with plenty of natural light and modern finishes.",
      },
    ],
  },
];

const PropertyManagement: React.FC = () => {
  const url = "addProperty";

  return (
    <RootLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Property Management</h1>

        {/* Search and Add Property */}
        <div className="flex items-center justify-between mb-6">
          <Input placeholder="Search properties..." className="max-w-sm" />
          <a href={`${window.location.pathname}/${url}`} className="flex items-center">
            <Button variant="default">Add New Property</Button>
          </a>
        </div>

        {/* Render each Property Card */}
        <div className="space-y-8">
          {properties.map((property, index) => (
            <Card key={index} className="border p-6 rounded-lg shadow-sm dark:border-gray-700">
              <CardHeader className="flex flex-col md:flex-row justify-between items-start">
                {/* Property Details */}
                <div className="mb-4 md:mb-0">
                  <CardTitle className="text-lg font-semibold dark:text-white">
                    {property.propertyName}
                  </CardTitle>
                  <CardDescription className="flex items-center text-gray-500 dark:text-gray-400">
                    <MapPin size={16} className="mr-1" />
                    {property.address}, {property.location}
                  </CardDescription>
                </div>
                {/* Property Status */}
                <div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                    {property.status}
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
                      {property.units.map((unit, uIndex) => (
                        <div
                          key={uIndex}
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start"
                        >
                          <div>
                            <p className="text-sm font-medium dark:text-white">
                              Room #{unit.roomNumber}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Price: ${unit.price}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {unit.description}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0 flex flex-col items-end">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                unit.status === "Vacant"
                                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                                  : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                              }`}
                            >
                              {unit.status}
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
          ))}
        </div>
      </div>
    </RootLayout>
  );
};

export default PropertyManagement;
