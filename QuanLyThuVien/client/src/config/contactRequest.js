import { apiClient } from './axiosClient';

const api = '/api/contacts';

export const requestCreateContact = async (data) => {
    try {
        const res = await apiClient.post(api, data);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const requestGetContacts = async (params) => {
    try {
        const res = await apiClient.get(api, { params });
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const requestUpdateContactStatus = async (id, status) => {
    try {
        const res = await apiClient.patch(`${api}/${id}/status`, { status });
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const requestDeleteContact = async (id) => {
    try {
        const res = await apiClient.delete(`${api}/${id}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};
