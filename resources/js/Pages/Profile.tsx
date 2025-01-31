"use client";

import React, { useState } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";

const Profile: React.FC = () => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <RootLayout>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Profile</h1>

                <div className="border p-8 rounded-lg">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex flex-col items-center space-y-3">
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                className="hidden"
                                id="profile-photo-input"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="profile-photo-input"
                                className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 bg-gray-100 border border-dashed rounded-lg hover:bg-gray-200"
                            >
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <Camera size={32} className="text-gray-500" />
                                )}
                            </label>
                            <span className="text-sm text-gray-600">
                                {fileName || "No file selected"}
                            </span>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input placeholder="Enter your name" />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input placeholder="Enter your email" />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Bio</label>
                                <Input placeholder="Enter a short bio" />
                            </div>
                        </div>

                        <Button variant="default" className="mt-6">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </RootLayout>
    );
};

export default Profile;