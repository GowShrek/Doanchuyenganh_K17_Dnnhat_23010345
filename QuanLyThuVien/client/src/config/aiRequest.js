import { apiClient } from './axiosClient';

export const requestAiChat = async (messages) => {
    const res = await apiClient.post('/api/ai/chat', { messages });
    return res.data;
};
