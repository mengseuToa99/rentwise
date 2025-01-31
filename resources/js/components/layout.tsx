import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 p-6">
                        <SidebarTrigger />
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </ThemeProvider>
    );
}
