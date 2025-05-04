import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FileText, Settings, AlertCircle, Home, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/services/api/users";
import RootLayout from "@/components/layout";

interface DashboardStats {
    totalUsers?: number;
    totalProperties?: number;
    totalInvoices?: number;
    pendingVerifications?: number;
    totalRentals?: number;
    pendingPayments?: number;
    activeRentals?: number;
}

interface DashboardResponse {
    status: string;
    data: DashboardStats;
    role: string;
    message?: string;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({});
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string>('guest');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await userService.fetchDashboardData();
                
                // Simple validation
                if (response && response.length > 0) {
                    const dashboardData = response[0];
                    
                    if (dashboardData.status === 'success') {
                        // Set stats safely
                        setStats(dashboardData.data || {});
                        
                        // Set role safely
                        const userRole = dashboardData.role || 'guest';
                        setRole(userRole.toLowerCase());
                    } else {
                        setError(dashboardData.message || 'Failed to fetch dashboard data');
                        setStats({});
                        setRole('guest');
                    }
                } else {
                    setError('No dashboard data received');
                    setStats({});
                    setRole('guest');
                }
            } catch (error) {
                setError('Error loading dashboard data');
                setStats({});
                setRole('guest');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <RootLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                    </div>
                </div>
            </RootLayout>
        );
    }

    if (error) {
        return (
            <RootLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Dashboard</h2>
                        <p className="mt-2 text-gray-600">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </RootLayout>
        );
    }

    const renderStatsCards = () => {
        const normalizedRole = role || 'guest';
        
        if (normalizedRole === 'admin') {
            return (
                <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
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
                            <div className="text-2xl font-bold">{stats.totalProperties || 0}</div>
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
                            <div className="text-2xl font-bold">{stats.totalInvoices || 0}</div>
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
                            <div className="text-2xl font-bold">{stats.pendingVerifications || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Users awaiting verification
                            </p>
                        </CardContent>
                    </Card>
                </>
            );
        } else if (normalizedRole === 'landlord') {
            return (
                <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProperties || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Your properties
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                            <Home className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalRentals || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Active rental agreements
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalInvoices || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Generated invoices
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingPayments || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting payment
                            </p>
                        </CardContent>
                    </Card>
                </>
            );
        }

        // Default view if role is not admin or landlord
        return (
            <div className="text-center p-6">
                <h2 className="text-xl font-semibold mb-4">Welcome to your dashboard</h2>
                <p className="text-muted-foreground">No specific role-based statistics available.</p>
            </div>
        );
    };

    return (
        <RootLayout>
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {renderStatsCards()}
                </div>
            </div>
        </RootLayout>
    );
}
