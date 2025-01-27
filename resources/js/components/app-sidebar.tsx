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
import { LayoutDashboard, Wrench, MessageCircle, FileText, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle";

export function AppSidebar() {
    // Menu items
    const items = [
        {
            title: "Property Management",
            url: "/property",
            icon: LayoutDashboard,
        },
        {
            title: "Maintenance",
            url: "#",
            icon: Wrench,
        },
        {
            title: "Communication",
            url: "/communication",
            icon: MessageCircle,
        },
        {
            title: "Report",
            url: "#",
            icon: FileText,
        },
        {
            title: "Setting",
            url: "#",
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
                            <div className="p-2 bg-black rounded-full">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            {/* Profile Name */}
                            <div>
                                <h1 className="text-lg font-semibold">John Doe</h1>
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
                        <SidebarMenuButton
         
                            className="w-auto hover:bg-red-50 hover:text-red-600 "
                        >
                            <LogOut />

                        </SidebarMenuButton>
                        <ModeToggle />
                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
