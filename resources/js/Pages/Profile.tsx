"use client";

import React, { useState, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";
import { userService } from "@/services/api/users";

interface UserData {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    profile_img: File | null;
}

const Profile: React.FC = () => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData>({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        profile_img: null
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userService.getProfile({});
                if (response.status === "success") {
                    const { user } = response.data;
                    setUserData({
                        username: user.username,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        phone_number: user.phone_number,
                        profile_img: null // Reset file input
                    });
                    
                    // Set preview if profile_img exists
                    if (user.profile_img) {
                        setPreview(user.profile_img);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        fetchProfile();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));
            setUserData(prev => ({
                ...prev,
                profile_img: file
            }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            
            // Append all user data to FormData
            Object.entries(userData).forEach(([key, value]) => {
                if (value !== null) {
                    formData.append(key, value);
                }
            });

            await userService.updateUser(formData);
            // Add success notification here
        } catch (error) {
            console.error("Failed to update profile:", error);
            // Add error notification here
        }
    };

    return (
        <RootLayout>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Profile</h1>

                <div className="border p-8 rounded-lg">
                    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
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

                        <div className="w-full max-w-2xl space-y-4">
                            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                                <div className="flex flex-col w-full md:w-1/2 space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <Input 
                                        name="first_name"
                                        value={userData.first_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div className="flex flex-col w-full md:w-1/2 space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input 
                                        name="last_name"
                                        value={userData.last_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your last name"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input 
                                    name="username"
                                    value={userData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter your username"
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input 
                                    name="email"
                                    type="email"
                                    value={userData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input 
                                    name="phone_number"
                                    value={userData.phone_number}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>

                        {/* <Button 
                            variant="default" 
                            className="mt-6"
                            type="submit"
                        >
                            Save Changes
                        </Button> */}
                    </form>
                </div>
            </div>
        </RootLayout>
    );
};

export default Profile;