import { apiClient } from './axiosClient';

const BASE = '/api/categories';

export const requestGetCategories = async (params) => {
    const res = await apiClient.get(BASE, { params });
    return res.data;
};

export const requestGetCategoryById = async (id) => {
    const res = await apiClient.get(`${BASE}/${id}`);
    return res.data;
};

export const requestCreateCategory = async (data) => {
    const res = await apiClient.post(BASE, data);
    return res.data;
};

export const requestUpdateCategory = async (id, data) => {
    const res = await apiClient.put(`${BASE}/${id}`, data);
    return res.data;
};

export const requestDeleteCategory = async (id) => {
    const res = await apiClient.delete(`${BASE}/${id}`);
    return res.data;
};

export const requestToggleCategoryActive = async (id) => {
    const res = await apiClient.patch(`${BASE}/${id}/toggle`);
    return res.data;
};
