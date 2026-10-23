import { apiClient } from './axiosClient';

const BASE = '/api/publishers';

export const requestGetPublishers = (params) => apiClient.get(BASE, { params }).then(r => r.data);
export const requestGetPublisherById = (id) => apiClient.get(`${BASE}/${id}`).then(r => r.data);
export const requestCreatePublisher = (data) => apiClient.post(BASE, data).then(r => r.data);
export const requestUpdatePublisher = (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data);
export const requestDeletePublisher = (id) => apiClient.delete(`${BASE}/${id}`).then(r => r.data);
export const requestTogglePublisherActive = (id) => apiClient.patch(`${BASE}/${id}/toggle`).then(r => r.data);
