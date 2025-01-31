"use client"; // Mark as Client Component (if using Next.js)

import React from "react";
import { Button } from "@/components/ui/button";
import RootLayout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Camera, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const PropertyManagement: React.FC = () => {
    const url = "addProperty"; // Ensure the route is correct

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

                {/* Property Card */}
                <div className="border p-6 rounded-lg  shadow-sm  dark:border-gray-700">

                    {/* Property Header - Label + Info */}
                    <div className="pr-4 flex justify-between items-start">
                        {/* Property Details */}
                        <div className="flex items-center space-x-6">
                            {/* Property Image Placeholder */}
                            <label className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 bg-gray-100 border border-dashed rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                                <Camera size={32} className="text-gray-500 dark:text-gray-300" />
                            </label>

                            {/* Property Details */}
                            <div className="flex flex-col justify-between h-24">
                                <h3 className="text-xl font-semibold dark:text-white">Property Name</h3>
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <MapPin size={16} className="mr-1" />
                                    <p>Property Address</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between h-32 items-end">
                            <span className="text-xs font-medium px-3 py-1 rounded bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                                Vacant
                            </span>

                            <Button variant="outline" className="text-xs px-4 py-2">
                                Update
                            </Button>

                        </div>
                    </div>


                    <Separator className="mt-6 dark:bg-gray-700" />


                    {/* Unit Cards Wrapper (Indented) */}
                    <div className="ml-12 space-y-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index}>
                                {/* Unit Card */}
                                <div className="p-4 rounded-lg flex justify-between items-center ">
                                    {/* Left Side: Image, Room Info */}
                                    <div className="flex items-center space-x-4">
                                        <label className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 bg-gray-100 border border-dashed rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                                            <Camera size={24} className="text-gray-500 dark:text-gray-300" />
                                        </label>
                                        <div className="flex flex-col justify-between h-16 items-end">
                                            <p className="text-sm font-medium dark:text-white">Room #{index + 1}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Price: $500</p>
                                        </div>
                                    </div>

                                    {/* Right Side: Label and Buttons */}
                                    <div className="flex flex-col justify-between h-24 items-end">
                                        {/* Subtle Unit Label (Push to Top) */}
                                        <span className={`text-xs font-medium px-3 py-1 rounded ${index % 2 === 0
                                            ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                                            : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                            }`}>
                                            {index % 2 === 0 ? "Vacant" : "Occupied"}
                                        </span>

                                        {/* Buttons (Push to Bottom) */}
                                        <div className="flex space-x-2 mt-auto">
                                            <Button variant="outline" className="text-xs px-3 py-1">
                                                Move In
                                            </Button>
                                            <Button variant="outline" className="text-xs px-3 py-1">
                                                Update
                                            </Button>
                                        </div>
                                    </div>

                                </div>

                                {/* Separator Below Each Unit (except last one) */}
                                {index < 2 && <Separator className="dark:bg-gray-700" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </RootLayout>
    );
};

export default PropertyManagement;
