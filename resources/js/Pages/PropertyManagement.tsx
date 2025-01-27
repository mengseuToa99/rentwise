"use client"; // Mark as Client Component (if using Next.js)

import React from "react";
import { Button } from "@/components/ui/button";
import RootLayout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Camera, MapPin } from "lucide-react";

const PropertyManagement: React.FC = () => {

    const url = "addProperty"; // Ensure the route is correct

    return (
        <RootLayout>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Property Management</h1>

                {/* Search and Add Property */}
                <div className="flex items-center justify-between mb-6">
                    <Input
                        placeholder="Search properties..."
                        className="max-w-sm"
                    />
                    <a href={`${window.location.pathname}/${url}`} className="flex items-center">
                        <Button variant="default">Add New Property</Button>
                    </a>
                </div>

                {/* This is where I show the property and unit */}
                <div className="border p-8 rounded-lg flex space-x-4">
                    <label
                        className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 bg-gray-100 border border-dashed rounded-lg hover:bg-gray-200"
                    >
                        <Camera
                            size={32}
                            className="text-gray-500"
                        />
                    </label>
                    <div className="flex flex-col justify-center">
                        <h3 className="text-xl font-semibold">Property Name</h3>
                        <div className="flex items-center text-gray-500">
                            <MapPin size={16} className="mr-1" />
                            <p>Property Address</p>
                        </div>
                    </div>
                </div>
            </div>
        </RootLayout>
    );
};

export default PropertyManagement;