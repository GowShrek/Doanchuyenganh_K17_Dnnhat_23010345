import { apiClient } from './axiosClient';

const BASE = '/api/books';

export const requestGetBooks = (params) => apiClient.get(BASE, { params }).then(r => r.data);
// Trang quản trị: gồm cả sách đang ẩn (API công khai chỉ trả sách đang hiển thị)
export const requestGetBooksForStaff = (params) => apiClient.get(`${BASE}/manage`, { params }).then(r => r.data);
export const requestGetBookById = (id) => apiClient.get(`${BASE}/${id}`).then(r => r.data);
export const requestCreateBook = (data) => apiClient.post(BASE, data).then(r => r.data);
export const requestUpdateBook = (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data);
export const requestDeleteBook = (id) => apiClient.delete(`${BASE}/${id}`).then(r => r.data);
export const requestToggleBookActive = (id) => apiClient.patch(`${BASE}/${id}/toggle`).then(r => r.data);
