import { apiClient } from './axiosClient';
const api = '/api/system-configs';

export const requestGetSystemConfigs = async () => {
    const res = await apiClient.get(api);
    return res.data;
};

export const requestUpdateSystemConfigs = async (data) => {
    const res = await apiClient.put(api, data);
    return res.data;
};
