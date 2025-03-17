// /resources/js/services/api/users.ts
import type { User } from './types/user';
import api from './axios-instance';

export const userService = {

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
    }
};