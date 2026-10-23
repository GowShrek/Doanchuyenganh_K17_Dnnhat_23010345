import { apiClient } from './axiosClient';
const api = '/api/reservations';

export const requestCreateReservation = async (bookId, data = {}) => {
    const res = await apiClient.post(`${api}/book/${bookId}`, data);
    return res.data;
};

export const requestGetMyReservations = async (params) => {
    const res = await apiClient.get(`${api}/my`, { params });
    return res.data;
};

export const requestGetMyReservationForBook = async (bookId) => {
    const res = await apiClient.get(`${api}/book/${bookId}/my`);
    return res.data;
};

export const requestGetQueueInfo = async (bookId) => {
    const res = await apiClient.get(`${api}/queue/${bookId}`);
    return res.data;
};

export const requestCancelReservation = async (id) => {
    const res = await apiClient.patch(`${api}/${id}/cancel`);
    return res.data;
};
