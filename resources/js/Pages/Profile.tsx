import React, { useState, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";
import { userService } from "@/services/api/users";

const Profile: React.FC = () => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        bio: "",
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
                        profile_img: user.profile_img
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

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));
            // Add file to userData
            setUserData(prev => ({
                ...prev,
                profile_img: file
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            // Create FormData to handle file upload
            const formData = new FormData();
            
            // Append all user data to FormData
            Object.keys(userData).forEach(key => {
                if (userData[key] !== null) {
                    formData.append(key, userData[key]);
                }
            });

            await userService.updateUser(userData.id, formData);
            // Add success notification here
        } catch (error) {
            console.error("Failed to update profile:", error);
            // Add error notification here
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Submit form data here
        console.log(formData);
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

                        <div className="w-fit space-y-4">
                            <div className="flex space-x-4">
                                <div className="flex flex-col w-1/2 space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <Input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div className="flex flex-col w-1/2 space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your last name"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Bio</label>
                                <Input
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Enter a short bio"
                                />
                            </div>
                        </div>

                        <Button variant="default" className="mt-6" type="submit">
                            Save Changes
                        </Button>
                    </form>
                </div>
            </div>
        </RootLayout>
    );
};

export default Profile;
