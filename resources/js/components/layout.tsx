import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner"
import { ReactNode } from "react";

interface RootLayoutProps {
    children: ReactNode;
    sidebar?: ReactNode;
}

export default function RootLayout({ children, sidebar }: RootLayoutProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    {sidebar || <AppSidebar />}
                    <main className="flex-1 p-6">
                        <SidebarTrigger />
                        {children}
                        <Toaster />
                    </main>
                </div>
            </SidebarProvider>
        </ThemeProvider>
    );
}
