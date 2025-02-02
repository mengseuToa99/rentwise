import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const AppRouter: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/communication" element={<Communication />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/add-user" element={<AccountPage />} />
                <Route path="/property" element={<PropertyManagement />} />
                <Route path="/property/addProperty" element={<AddProperty />} />
                <Route path="/add-user" element={<AccountPage />} />
                <Route path="/setting" element={<Setting />} />
                <Route path="/report" element={<Report />} />
                <Route path="/maintenance" element={<Maintenance />} />
                {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
        </Router>
    );
};

export default AppRouter;