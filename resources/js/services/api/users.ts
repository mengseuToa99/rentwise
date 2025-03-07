// /resources/js/services/api/users.ts
import type { User } from './types/user';
import api from './axios-instance';

export const userService = {

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