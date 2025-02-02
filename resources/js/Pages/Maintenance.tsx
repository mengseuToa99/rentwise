"use client";

import React, { useState } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";

const Maintenance: React.FC = () => {
    const [properties, setProperties] = useState([
        {
            id: 1,
            name: "Sunset Apartments",
            requests: [
                { id: 1, roomNumber: 101, issueTitle: "Leaky Faucet", description: "Bathroom faucet is leaking.", status: "Pending" },
                { id: 2, roomNumber: 102, issueTitle: "AC not working", description: "Air conditioner is not cooling.", status: "In Progress" },
            ],
        },
        {
            id: 2,
            name: "Greenwood Residence",
            requests: [
                { id: 3, roomNumber: 201, issueTitle: "Broken Window", description: "Window in the living room is cracked.", status: "Pending" },
                { id: 4, roomNumber: 202, issueTitle: "Heater not working", description: "Heater is not turning on.", status: "Resolved" },
                { id: 5, roomNumber: 203, issueTitle: "Clogged Drain", description: "The kitchen sink is clogged.", status: "Pending" },
            ],
        },
    ]);

    const [collapsedProperties, setCollapsedProperties] = useState<Set<number>>(new Set());
    const [openRequests, setOpenRequests] = useState<Set<number>>(new Set());

    const handleDelete = (propertyId: number, requestId: number) => {
        setProperties((prev) =>
            prev.map((property) =>
                property.id === propertyId
                    ? { ...property, requests: property.requests.filter((req) => req.id !== requestId) }
                    : property
            )
        );
    };

    const toggleProperty = (id: number) => {
        setCollapsedProperties((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const toggleRequest = (id: number) => {
        setOpenRequests((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    return (
        <RootLayout>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Maintenance Requests</h1>

                {/* Add Maintenance Request Button */}
                <div className="flex justify-end mb-6">
                    <Button 
                        variant="outline" 
                        className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black"
                        onClick={() => window.location.href = "/maintenance/new"}
                    >
                        <Plus size={16} /> Add Request
                    </Button>
                </div>

                <div className="space-y-6">
                    {properties.map((property) => (
                        <Card key={property.id} className="shadow-lg">
                            {/* Property Header */}
                            <CardHeader className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-t-lg p-4">
                                <h2 className="text-xl font-semibold">{property.name}</h2>
                                {property.requests.length > 0 && (
                                    <Button variant="ghost" onClick={() => toggleProperty(property.id)}>
                                        {collapsedProperties.has(property.id) ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                    </Button>
                                )}
                            </CardHeader>

                            {/* Maintenance Requests */}
                            <Collapsible open={!collapsedProperties.has(property.id)}>
                                <CollapsibleContent>
                                    <CardContent className="space-y-4 p-4">
                                        {property.requests.length > 0 ? (
                                            property.requests.map((request) => (
                                                <Collapsible key={request.id} open={openRequests.has(request.id)} className="border rounded-lg shadow-sm p-4">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="text-lg font-medium">{request.issueTitle}</h3>
                                                            <p className="text-sm text-gray-500">Room: {request.roomNumber}</p>
                                                            <span className={`text-sm font-semibold ${request.status === "Resolved" ? "text-green-600" : "text-orange-500"}`}>
                                                                {request.status}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center space-x-3">
                                                            <Button variant="destructive" size="icon" onClick={() => handleDelete(property.id, request.id)}>
                                                                <Trash2 size={16} />
                                                            </Button>
                                                            <CollapsibleTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => toggleRequest(request.id)}>
                                                                    {openRequests.has(request.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                                </Button>
                                                            </CollapsibleTrigger>
                                                        </div>
                                                    </div>

                                                    {/* Request Description */}
                                                    <CollapsibleContent>
                                                        <div className="mt-4 border-t pt-4">
                                                            <p className="text-sm text-gray-600">{request.description}</p>
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">No maintenance requests for this property.</p>
                                        )}
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>

                            <CardFooter className="bg-gray-100 dark:bg-gray-800 rounded-b-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                                Total Requests: {property.requests.length}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </RootLayout>
    );
};

export default Maintenance;
