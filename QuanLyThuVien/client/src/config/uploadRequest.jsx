import { apiClient } from './axiosClient';

export const requestUploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

/**
 * Upload nhiều ảnh cùng lúc
 * @param {File[]} files
 * @returns {Promise<Array<{url, filename, originalName, size}>>}
 */
export const requestUploadImages = async (files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const res = await apiClient.post('/api/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const requestDeleteImage = async (filename) => {
    const res = await apiClient.delete(`/api/upload/image/${filename}`);
    return res.data;
};
