import { apiClient } from './axiosClient';
const api = '/api/borrows';

// Admin/Thủ thư: Lấy tất cả phiếu mượn
export const requestGetBorrows = async (params) => {
    const res = await apiClient.get(api, { params });
    return res.data;
};

// Admin/Thủ thư: Stats tổng quan
export const requestGetBorrowStats = async () => {
    const res = await apiClient.get(`${api}/stats`);
    return res.data;
};

// Chi tiết phiếu
export const requestGetBorrowById = async (id) => {
    const res = await apiClient.get(`${api}/${id}`);
    return res.data;
};

// Duyệt phiếu
export const requestApproveBorrow = async (id) => {
    const res = await apiClient.patch(`${api}/${id}/approve`);
    return res.data;
};

// Từ chối
export const requestRejectBorrow = async (id, note) => {
    const res = await apiClient.patch(`${api}/${id}/reject`, { note });
    return res.data;
};

// Xác nhận trả sách
export const requestReturnBook = async (id, { note, condition } = {}) => {
    const res = await apiClient.patch(`${api}/${id}/return`, { note, condition });
    return res.data;
};

// Độc giả gửi yêu cầu mượn
export const requestCreateBorrow = async ({ bookId, note, borrowDate, dueDate }) => {
    const res = await apiClient.post(api, { bookId, note, borrowDate, dueDate });
    return res.data;
};

// Độc giả xem lịch sử của mình
export const requestGetMyBorrows = async (params) => {
    const res = await apiClient.get(`${api}/my`, { params });
    return res.data;
};

export const requestRenewBorrow = async (id, data) => {
    const res = await apiClient.post(`${api}/${id}/renew`, data);
    return res.data;
};

export const requestApproveRenew = async (id) => {
    const res = await apiClient.patch(`${api}/${id}/approve-renew`);
    return res.data;
};

export const requestRejectRenew = async (id, data) => {
    const res = await apiClient.patch(`${api}/${id}/reject-renew`, data);
    return res.data;
};
