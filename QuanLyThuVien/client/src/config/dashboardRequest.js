import { apiClient } from './axiosClient';

export const requestGetDashboardStats = async () => {
    try {
        const res = await apiClient.get('/api/dashboard');
        return res.data;
    } catch (error) {
        throw error;
    }
};
