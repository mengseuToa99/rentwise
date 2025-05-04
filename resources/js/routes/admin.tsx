import { createBrowserRouter } from 'react-router-dom';
import AdminRouteGuard from '@/components/auth/AdminRouteGuard';
import AdminDashboard from '@/Pages/Admin/Dashboard';

export const adminRoutes = createBrowserRouter([
    {
        path: '/admin',
        element: (
            <AdminRouteGuard>
                <AdminDashboard />
            </AdminRouteGuard>
        ),
    },
    {
        path: '/admin/dashboard',
        element: (
            <AdminRouteGuard>
                <AdminDashboard />
            </AdminRouteGuard>
        ),
    },
    // Add more admin routes here as needed
]); 