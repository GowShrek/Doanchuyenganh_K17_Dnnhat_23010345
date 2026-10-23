import { apiClient } from './axiosClient';

const api = '/api/articles';

export const requestGetArticles = async (params) => {
    try {
        const res = await apiClient.get(api, { params });
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const requestGetArticleBySlug = async (slug) => {
    try {
        const res = await apiClient.get(`${api}/slug/${slug}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const requestGetArticleById = async (id) => {
    try {
        const res = await apiClient.get(`${api}/${id}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const requestCreateArticle = async (data) => {
    try {
        const res = await apiClient.post(api, data);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const requestUpdateArticle = async (id, data) => {
    try {
        const res = await apiClient.put(`${api}/${id}`, data);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const requestDeleteArticle = async (id) => {
    try {
        const res = await apiClient.delete(`${api}/${id}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const requestToggleArticleStatus = async (id) => {
    try {
        const res = await apiClient.patch(`${api}/${id}/toggle-status`);
        return res.data;
    } catch (error) {
        throw error;
    }
};
