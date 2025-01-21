import React from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "./Navbar";

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex min-h-screen bg-background">
                {/* Navbar */}
                <Navbar />
                {/* Main content */}
                <main className="ml-64 flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </ThemeProvider>
    );
}