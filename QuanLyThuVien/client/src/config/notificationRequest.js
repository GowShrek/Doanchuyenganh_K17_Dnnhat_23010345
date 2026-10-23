import { apiClient } from './axiosClient';
const api = '/api/notifications';

export const requestGetNotifications = async (params) => {
    const res = await apiClient.get(api, { params });
    return res.data;
};

export const requestMarkNotificationRead = async (id) => {
    const res = await apiClient.patch(`${api}/${id}/read`);
    return res.data;
};

export const requestMarkAllNotificationsRead = async () => {
    const res = await apiClient.patch(`${api}/read-all`);
    return res.data;
};

export const requestDeleteNotification = async (id) => {
    const res = await apiClient.delete(`${api}/${id}`);
    return res.data;
};
