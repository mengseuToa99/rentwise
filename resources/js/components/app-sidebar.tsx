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
    Wrench,
    MessageCircle,
    FileText,
    Settings,
    LogOut,
    User,
    Newspaper,
    Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle";
import { userService } from "@/services/api/users";
import React, { useState, useEffect } from "react";
// import LanguageSwitcher from "./LanguageSwitcher"

interface UserData {
    username: string;
    role: string;
}

export function AppSidebar() {
    const [preview, setPreview] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData>({
        username: "",
        role: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userService.getProfile();
                if (response.status === "success") {
                    const { user } = response.data;
                    setUserData({
                        username: user.username,
                        role: user.role
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

    // Menu items
    const items = [
        {
            title: "Property Management",
            url: "/property",
            icon: LayoutDashboard,
        },
        {
            title: "Invoice Management",
            url: "/invoice",
            icon: FileText,
        },
        // {
        //     title: "User Account",
        //     url: "/add-user",
        //     icon: User,
        // },
        {
            title: "Maintenance",
            url: "/maintenance",
            icon: Wrench,
        },
        {
            title: "Communication",
            url: "/communication",
            icon: MessageCircle,
        },
        {
            title: "Report",
            url: "/report",
            icon: Newspaper,
        },
        {
            title: "Setting",
            url: "/setting",
            icon: Settings,
        },
    ];

    return (
        <Sidebar>
            <SidebarContent className="flex flex-col h-full">
                {/* Profile Section */}
                <div className="p-4">
                    <div className="flex items-center space-x-3">
                        {/* Profile Icon */}
                        <a href="/profile">
                            <div className="p-2 bg-black rounded-full">
                                <User className="h-6 w-6 text-white" />
                            </div>
                        </a>
                        {/* Profile Name */}
                        <div>
                            <h1 className="text-lg font-semibold">{userData.username}</h1>
                            <p className="text-sm text-gray-500">{userData.role}</p>
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
                                        <SidebarMenuButton asChild className="p-5">
                                            <a href={item.url} className="flex items-center">
                                                <item.icon className="mr-2 h-4 w-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </div>

                <SidebarSeparator />

                {/* Logout Button */}
                <SidebarGroup>
                    <div className="flex justify-between">
                        <a href="/login">
                            <SidebarMenuButton className="w-auto hover:bg-red-50 hover:text-red-600 ">
                                <LogOut />
                            </SidebarMenuButton>
                        </a>
                        <ModeToggle />
                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
