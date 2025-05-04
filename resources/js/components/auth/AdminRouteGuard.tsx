import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services/api/users';

interface User {
    user_id: number;
    username: string;
    email: string;
    roles: Array<{
        role_id: number;
        role_name: string;
    }>;
}

interface AdminRouteGuardProps {
    children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const response = await userService.getProfile({});
                const user = response.data.user as User;
                
                const isAdmin = user.roles.some(role => role.role_name.toLowerCase() === 'admin');
                setIsAuthorized(isAdmin);

                if (!isAdmin) {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error checking admin access:', error);
                navigate('/login');
            }
        };

        checkAdminAccess();
    }, [navigate]);

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
} 