// /resources/js/services/api/users.ts
import type { User } from './types/user';
import api from './axios-instance';

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
    message: string;
}

export const userService = {
    fetchDashboardData: async (): Promise<DashboardResponse[]> => {
        try {
            const response = await api.get('/rentwise/dashboard/stats');
            
            // Simple response handling - directly use the data as provided
            if (!response.data) {
                throw new Error('No data received from server');
            }
            
            // Handle different response formats
            let dashboardData;
            if (Array.isArray(response.data)) {
                dashboardData = response.data;
            } else {
                // If it's a single object, wrap it in an array
                dashboardData = [response.data];
            }
            
            // Ensure the first item has the required fields
            if (dashboardData.length > 0) {
                if (!dashboardData[0].status) {
                    dashboardData[0].status = 'success';
                }
                if (!dashboardData[0].role) {
                    dashboardData[0].role = 'guest';
                }
                if (!dashboardData[0].data) {
                    dashboardData[0].data = {};
                }
            } else {
                // Create a default dashboard data if none exists
                dashboardData = [{
                    status: 'success',
                    data: {},
                    role: 'guest',
                    message: 'No dashboard data available'
                }];
            }
            
            return dashboardData;
        } catch (error) {
            // Return a standardized error response
            return [{
                status: 'error',
                data: {},
                role: 'guest',
                message: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
            }];
        }
    },

    getInboxUsers: async (): Promise<User[]> => {
        try {
            const response = await api.get('/rentwise/inbox');
            console.log('Raw API response:', response);
            
            // The response should now be directly the JSON object, not an array
            console.log('Full data:', response.data);
            
            // Access the users directly from the response
            console.log('Users data:', response.data.users);
            return response.data.users || [];
        } catch (error) {
            console.error('Error fetching inbox users:', error);
            throw error;
        }
    },

    // Fetch messages for a chat room
    userChatRoom: async (userId: number) => {
        try {
            const response = await api.get(`/rentwise/message/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Send a message
    sendMessage: async (userId: number, messageData: { message: string; conversation_id: number }) => {
        try {
            const response = await api.post(`/rentwise/message/${userId}`, messageData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    getProfile: async () => {
        try {
            const response = await api.get('/rentwise/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    
    updateProfile: async (userData: FormData) => {
        try {
            const user_id = userData.get('user_id'); // Changed from 'id' to 'user_id'
            const response = await api.put(`/rentwise/profile-edit/${user_id}`, userData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    userLogin: async (userData: Partial<User>) => {
        try {
            const response = await api.post('/rentwise/login', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createSingleUser: async (userData: Partial<User>) => {
        try {
            const response = await api.post('/rentwise/create-user', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createMultipleUsers: async (users: Partial<User>[]) => {
        try {
            const response = await api.post('/rentwise/create-users', { users });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUsersWithRoles: async (): Promise<User[]> => {
        try {
            const response = await api.get('/rentwise/users/role');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUser: async (userId: number, userData: Partial<User>) => {
        try {
            const response = await api.put(`/rentwise/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteUser: async (userId: number) => {
        try {
            const response = await api.delete(`/rentwise/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUsers: async (): Promise<User[]> => {
        try {
            const response = await api.get('/rentwise/users');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProperties: async () => {
        try {
            const response = await api.get('/rentwise/properties');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getInvoices: async () => {
        try {
            const response = await api.get('/rentwise/invoices');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};