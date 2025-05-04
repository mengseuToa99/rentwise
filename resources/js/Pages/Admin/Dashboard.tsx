import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FileText, Settings, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/services/api/users";
import { User } from "@/services/api/types/user";
import { AdminSidebar } from "@/components/admin-sidebar";
import RootLayout from "@/components/layout";

interface ApiResponse<T> {
    data: T;
    status: string;
    message?: string;
}

interface DashboardStats {
    totalUsers: number;
    totalProperties: number;
    totalInvoices: number;
    pendingVerifications: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalProperties: 0,
        totalInvoices: 0,
        pendingVerifications: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Check if user is admin
                const userResponse = await userService.getProfile();
                const user = userResponse.data.user as User;
                
                const isAdmin = user.roles.some(role => role.role_name.toLowerCase() === 'admin');
                if (!isAdmin) {
                    navigate('/dashboard'); // Redirect to regular dashboard if not admin
                    return;
                }

                // Fetch dashboard statistics
                const [usersResponse, propertiesResponse, invoicesResponse] = await Promise.all([
                    userService.getUsers(),
                    userService.getProperties(),
                    userService.getInvoices()
                ]);

                // Handle the response data based on the actual structure
                const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse as ApiResponse<User[]>).data || [];
                const properties = Array.isArray(propertiesResponse) ? propertiesResponse : (propertiesResponse as ApiResponse<any[]>).data || [];
                const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : (invoicesResponse as ApiResponse<any[]>).data || [];

                setStats({
                    totalUsers: users.length,
                    totalProperties: properties.length,
                    totalInvoices: invoices.length,
                    pendingVerifications: users.filter((u: User) => u.status !== 'active').length
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <RootLayout sidebar={<AdminSidebar />}>
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                Active users in the system
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProperties}</div>
                            <p className="text-xs text-muted-foreground">
                                Registered properties
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                            <p className="text-xs text-muted-foreground">
                                Generated invoices
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                            <p className="text-xs text-muted-foreground">
                                Users awaiting verification
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/admin/users')}>
                            <CardHeader>
                                <CardTitle className="text-lg">Manage Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    View and manage all users in the system
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/admin/properties')}>
                            <CardHeader>
                                <CardTitle className="text-lg">Manage Properties</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    View and manage all properties
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/admin/settings')}>
                            <CardHeader>
                                <CardTitle className="text-lg">System Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Configure system-wide settings
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </RootLayout>
    );
} 