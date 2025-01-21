import React from 'react';
import { LayoutDashboard, Wrench, MessageCircle, FileText, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from './ModeToggle';

const Navbar = () => {
    return (
        <nav className="h-screen w-64 bg-background border-r flex flex-col">
            {/* Profile Section */}
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

            <Separator />

            {/* Navigation Links */}
            <ul className="flex-1 p-4 space-y-2">
                <li>
                    <Button 
                        variant="outline" 
                        className="w-full justify-start border-gray-400 hover:bg-gray-100 hover:border-gray-500"
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Property Management
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="outline" 
                        className="w-full justify-start border-gray-400 hover:bg-gray-100 hover:border-gray-500"
                    >
                        <Wrench className="mr-2 h-4 w-4" />
                        Maintenance
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="outline" 
                        className="w-full justify-start border-gray-400 hover:bg-gray-100 hover:border-gray-500"
                    >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Communication
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="outline" 
                        className="w-full justify-start border-gray-400 hover:bg-gray-100 hover:border-gray-500"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Report
                    </Button>
                </li>
                <li>
                    <Button 
                        variant="outline" 
                        className="w-full justify-start border-gray-400 hover:bg-gray-100 hover:border-gray-500"
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Setting
                    </Button>
                </li>
            </ul>

            <Separator />

            {/* Logout Button */}
            <div className="p-4">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;