"use client";

import React, { useState, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";
import { userService } from "@/services/api/users";

interface UserData {
    id?: number;
    user_id?: number;  // Added this
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    profile_img: File | null;
    profile_picture?: string | null;  // Added this
    id_card_picture?: string | null;  // Added this
    status?: string;
    last_login?: string | null;
    failed_login_attempts?: number;
}

const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
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

    const fetchProfile = async () => {
        try {
            const response = await userService.getProfile({});
            if (response.status === "success") {
                const { user } = response.data;
                setUserData({
                    id: user.user_id,  // Changed from id to user_id
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone_number: user.phone_number,
                    profile_img: null
                });
                
                if (user.profile_picture) {  // Changed from profile_img to profile_picture
                    setPreview(user.profile_picture);
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    useEffect(() => {

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
            
            // Add user_id instead of id to match your API response structure
            if (userData.id) {
                formData.append('user_id', userData.id.toString());
            }
    
            // Add all fields that need to be updated
            if (userData.first_name) formData.append('first_name', userData.first_name);
            if (userData.last_name) formData.append('last_name', userData.last_name);
            if (userData.phone_number) formData.append('phone_number', userData.phone_number);
            if (userData.email) formData.append('email', userData.email);
            if (userData.profile_img) formData.append('profile_img', userData.profile_img);
    
            // Log FormData for debugging
            for (let pair of formData.entries()) {
                console.log('FormData content:', pair[0], pair[1]);
            }
    
            const response = await userService.updateProfile(formData);
            
            if (response.status === "success") {
                await fetchProfile();
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
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
                                disabled={!isEditing}
                            />
                            <label
                                htmlFor="profile-photo-input"
                                className={`flex flex-col items-center justify-center w-32 h-32 bg-gray-100 border border-dashed rounded-lg ${isEditing ? 'hover:bg-gray-200 cursor-pointer' : ''}`}
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
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="flex flex-col w-full md:w-1/2 space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input 
                                        name="last_name"
                                        value={userData.last_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your last name"
                                        disabled={!isEditing}
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
                                    disabled={!isEditing}
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
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input 
                                    name="phone_number"
                                    value={userData.phone_number}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end w-full max-w-2xl mt-6">
                            {isEditing ? (
                                <div className="space-x-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsEditing(false)}
                                        type="button"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    onClick={() => setIsEditing(true)}
                                    type="button"
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </RootLayout>
    );
};

export default Profile;