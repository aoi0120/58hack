import * as SecureStore from 'expo-secure-store';
import axios, { InternalAxiosRequestConfig } from "axios";

export const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) {
            throw error;
        }

        if (error.response.status === 401) {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (!refreshToken) {
                await SecureStore.deleteItemAsync('token');
                throw error;
            }

            refreshing ??= (async () => {
                try {
                    // リフレッシュトークンを使って新しいアクセストークンを取得
                    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
                        refreshToken: refreshToken
                    });

                    const newAccessToken = response.data.token;
                    if (newAccessToken) {
                        // 新しいトークンを保存
                        await SecureStore.setItemAsync('token', newAccessToken);
                        return newAccessToken;
                    }
                    return null;
                } catch (refreshError) {
                    console.error('トークンリフレッシュエラー:', refreshError);
                    // リフレッシュに失敗した場合、両方のトークンを削除
                    await SecureStore.deleteItemAsync('token');
                    await SecureStore.deleteItemAsync('refreshToken');
                    return null;
                } finally {
                    refreshing = null;
                }
            })();

            const newToken = await refreshing;
            if (!newToken) {
                throw error;
            }

            error.config.headers.Authorization = `Bearer ${newToken}`;
            return api(error.config);
        }

        throw error;
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