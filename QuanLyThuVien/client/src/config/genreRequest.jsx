import { apiClient } from './axiosClient';

const BASE = '/api/genres';

export const requestGetGenres = (params) => apiClient.get(BASE, { params }).then(r => r.data);
export const requestGetGenreById = (id) => apiClient.get(`${BASE}/${id}`).then(r => r.data);
export const requestCreateGenre = (data) => apiClient.post(BASE, data).then(r => r.data);
export const requestUpdateGenre = (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data);
export const requestDeleteGenre = (id) => apiClient.delete(`${BASE}/${id}`).then(r => r.data);
export const requestToggleGenreActive = (id) => apiClient.patch(`${BASE}/${id}/toggle`).then(r => r.data);
