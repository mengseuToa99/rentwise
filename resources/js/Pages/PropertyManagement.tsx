"use client"; // Mark as Client Component (if using Next.js)

import React from "react";
import { Button } from "@/components/ui/button";
import RootLayout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PropertyManagement: React.FC = () => {

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
                    <Button variant="default">Add New Property</Button>
                </div>

                {/*this is where i show the property and unit */}
            </div>
        </RootLayout>
    );
};

export default PropertyManagement;
