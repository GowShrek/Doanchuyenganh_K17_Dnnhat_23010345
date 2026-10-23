import { apiClient } from './axiosClient';
const api = '/api/reviews';

export const requestGetLatestReviews = async (params) => {
    const res = await apiClient.get('/api/reviews/latest', { params });
    return res.data;
};

export const requestGetReviews = async (bookId, params) => {
    const res = await apiClient.get(`${api}/book/${bookId}`, { params });
    return res.data;
};

export const requestGetMyReview = async (bookId) => {
    const res = await apiClient.get(`${api}/book/${bookId}/my`);
    return res.data;
};

export const requestUpsertReview = async (bookId, data) => {
    const res = await apiClient.post(`${api}/book/${bookId}`, data);
    return res.data;
};

export const requestDeleteReview = async (bookId) => {
    const res = await apiClient.delete(`${api}/book/${bookId}`);
    return res.data;
};

// Admin requests
export const requestGetAllReviews = async (params) => {
    const res = await apiClient.get(api, { params });
    return res.data;
};

export const requestToggleReviewStatus = async (id) => {
    const res = await apiClient.patch(`${api}/${id}/toggle`);
    return res.data;
};
