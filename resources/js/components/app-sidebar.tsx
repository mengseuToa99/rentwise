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
            url: "property",
            icon: LayoutDashboard,
        },
        {
            title: "Maintenance",
            url: "#",
            icon: Wrench,
        },
        {
            title: "Communication",
            url: "communication",
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
            <SidebarContent>
                {/* Profile Section */}
                <SidebarGroup>
                    <div className="p-6">
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
                            <ModeToggle />
                        </div>
                    </div>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Navigation Links */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
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

                <SidebarSeparator />

                {/* Logout Button */}
                <SidebarGroup>
                    <div className="p-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-start hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}