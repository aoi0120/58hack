import * as SecureStore from 'expo-secure-store';
import axios, { InternalAxiosRequestConfig } from "axios";

export const api = axios.create({ baseURL: "http://localhost:5000/api" });

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response.status === 401) throw error;

        if (!refreshing) {
            refreshing = (async () => {
                const rf = await SecureStore.getItem('refreshToken');
                if (!rf) return null;
                try {
                    const { data } = await api.post('/auth/refresh', { refreshToken: rf });
                    await SecureStore.setItemAsync('token', data.token);
                    return data.token as string;
                } catch {
                    await SecureStore.deleteItemAsync('token');
                    await SecureStore.deleteItemAsync('refreshToken');
                    return null;
                } finally {
                    refreshing = null;
                }
            })();
        }
        const newToken = await refreshing;
        if (!newToken) throw error;

        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api(error.config);
    }
);

export const sendYesterdaySteps = async (steps: number) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];

    try {
        const response = await api.post('/steps/yesterday', {
            steps,
            date: dateString
        });
        return response.data;
    } catch (error) {
        console.error('昨日の歩数データ送信エラー:', error);
        throw error;
    }
};