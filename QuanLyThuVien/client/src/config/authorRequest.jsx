import { apiClient } from './axiosClient';

const BASE = '/api/authors';

export const requestGetAuthors = (params) => apiClient.get(BASE, { params }).then(r => r.data);
export const requestGetAuthorById = (id) => apiClient.get(`${BASE}/${id}`).then(r => r.data);
export const requestCreateAuthor = (data) => apiClient.post(BASE, data).then(r => r.data);
export const requestUpdateAuthor = (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data);
export const requestDeleteAuthor = (id) => apiClient.delete(`${BASE}/${id}`).then(r => r.data);
export const requestToggleAuthorActive = (id) => apiClient.patch(`${BASE}/${id}/toggle`).then(r => r.data);
