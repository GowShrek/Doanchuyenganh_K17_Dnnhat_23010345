import { apiClient } from './axiosClient';
const api = '/api/fines';

export const requestGetFines = async (params) => {
    const res = await apiClient.get(api, { params });
    return res.data;
};

export const requestGetFineStats = async () => {
    const res = await apiClient.get(`${api}/stats`);
    return res.data;
};

export const requestGetFineById = async (id) => {
    const res = await apiClient.get(`${api}/${id}`);
    return res.data;
};

export const requestMarkFinePaid = async (id) => {
    const res = await apiClient.patch(`${api}/${id}/pay`);
    return res.data;
};

export const requestWaiveFine = async (id, reason) => {
    const res = await apiClient.patch(`${api}/${id}/waive`, { reason });
    return res.data;
};

export const requestGetMyFines = async (params) => {
    const res = await apiClient.get(`${api}/my`, { params });
    return res.data;
};

export const requestCreateFinePayment = async (fineId, method) => {
    const res = await apiClient.post(`${api}/${fineId}/payment`, { method });
    return res.data;
};
