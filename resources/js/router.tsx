import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { userService } from '@/services/api/users';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import Communication from './Pages/Communication';
import PropertyManagement from './Pages/PropertyManagement';
import AddProperty from './Pages/AddProperty';
import AccountPage from './Pages/AddAccount';
import Profile from './Pages/Profile';
import Setting from './Pages/Setting';
import Report from './Pages/Report';
import Maintenance from './Pages/Maintenance';
import EditProperty from './Pages/EditProperty';
import EditUnit from './Pages/EditUnit';
import InvoiceManagement from './Pages/InvoiceManagement';
import AdminDashboard from './Pages/Admin/Dashboard';

const AppRouter: React.FC = () => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    console.log("Stored user data:", user); // Debug log
                    const role = user?.roles?.[0]?.toLowerCase() || null;
                    console.log("User role from localStorage:", role); // Debug log
                    setUserRole(role);
                } else {
                    const response = await userService.getProfile();
                    console.log("Profile response:", response); // Debug log
                    const role = response?.roles?.[0]?.toLowerCase() || null;
                    console.log("User role from profile:", role); // Debug log
                    setUserRole(role);
                }
            } catch (error) {
                console.error('Error checking user role:', error);
                setUserRole(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserRole();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                    userRole === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/property" replace />
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                    userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />
                } />
                
                {/* Regular User Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/communication" element={<Communication />} />
                <Route path="/add-user" element={<AccountPage />} />
                <Route path="/property" element={<PropertyManagement />} />
                <Route path="/property/addProperty" element={<AddProperty />} />
                <Route path="/setting" element={<Setting />} />
                <Route path="/report" element={<Report />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/property/editProperty/:id" element={<EditProperty />} />
                <Route path="/property/editUnit/:propertyId/:roomId" element={<EditUnit />} />
                <Route path="/invoice" element={<InvoiceManagement />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;