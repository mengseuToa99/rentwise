import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    Settings,
    LogOut,
    User,
    AlertCircle,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle";
import { userService } from "@/services/api/users";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface UserData {
    username: string;
    role: string;
}

export function AdminSidebar() {
    const [preview, setPreview] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData>({
        username: "",
        role: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userService.getProfile();
                if (response.status === "success") {
                    const { user } = response.data;
                    setUserData({
                        username: user.username,
                        role: user.roles[0].role_name
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Admin menu items
    const items = [
        {
            title: "Dashboard",
            url: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "User Management",
            url: "/admin/add-user",
            icon: Users,
        },
        {
            title: "Property Management",
            url: "/admin/properties",
            icon: Building2,
        },
        {
            title: "Invoice Management",
            url: "/admin/invoices",
            icon: FileText,
        },
        {
            title: "Reports & Analytics",
            url: "/admin/reports",
            icon: BarChart3,
        },
        {
            title: "System Settings",
            url: "/admin/settings",
            icon: Settings,
        },
        {
            title: "Verification Requests",
            url: "/admin/verifications",
            icon: AlertCircle,
        },
    ];

    return (
        <Sidebar>
            <SidebarContent className="flex flex-col h-full">
                {/* Profile Section */}
                <div className="p-4">
                    <div className="flex items-center space-x-3">
                        {/* Profile Icon */}
                        <div className="p-2 bg-black rounded-full">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        {/* Profile Name */}
                        <div>
                            <h1 className="text-lg font-semibold">{userData.username}</h1>
                            <p className="text-sm text-gray-500">Admin</p>
                        </div>
                    </div>
                </div>

                <SidebarSeparator />

                {/* Navigation Links */}
                <div className="flex-grow">
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-2">
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton 
                                            asChild 
                                            className="p-5"
                                            onClick={() => navigate(item.url)}
                                        >
                                            <div className="flex items-center cursor-pointer">
                                                <item.icon className="mr-2 h-4 w-4" />
                                                <span>{item.title}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </div>

                <SidebarSeparator />

                {/* Bottom Section */}
                <SidebarGroup>
                    <div className="flex justify-between p-4">
                        <Button 
                            variant="ghost" 
                            className="hover:bg-red-50 hover:text-red-600"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                        <ModeToggle />
                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
} 