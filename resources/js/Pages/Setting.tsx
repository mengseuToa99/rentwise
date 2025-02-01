"use client";

import React, { useState } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const Setting: React.FC = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    // Handle switch change for notifications
    const handleNotificationsChange = (checked: boolean) => {
        setNotificationsEnabled(checked);
    };

    // Handle switch change for dark mode
    const handleDarkModeChange = (checked: boolean) => {
        setDarkModeEnabled(checked);
    };

    return (
        <RootLayout>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>

                <div className="border p-8 rounded-lg space-y-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Enable Notifications</label>
                            <Switch 
                                checked={notificationsEnabled} 
                                onCheckedChange={handleNotificationsChange} 
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Enable Dark Mode</label>
                            <Switch 
                                checked={darkModeEnabled} 
                                onCheckedChange={handleDarkModeChange} 
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium">Change Password</label>
                            <Input type="password" placeholder="Enter new password" />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input type="password" placeholder="Confirm new password" />
                        </div>
                    </div>

                    <Button variant="default" className="mt-6">
                        Save Changes
                    </Button>
                </div>
            </div>
        </RootLayout>
    );
};

export default Setting;