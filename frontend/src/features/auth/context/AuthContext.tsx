import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import * as SecureStore from 'expo-secure-store';

type Auth = {
    user: { id: string; email: string; name: string; age: number } | null;
    loading: boolean;
    register: (email: string, password: string, name: string, age: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<Auth | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('認証コンテキストが見つかりません。');
    }
    return context;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Auth["user"]>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const token = await SecureStore.getItemAsync('token');
                if (token) {
                    api.defaults.headers.common.Authorization = `Bearer ${token}`;

                    try {
                        const { data } = await api.get('/auth/me');
                        setUser(data.user);
                    } catch (apiError) {
                        console.error('ユーザー情報の取得に失敗しました:', apiError);
                        await SecureStore.deleteItemAsync('token');
                        delete api.defaults.headers.common.Authorization;
                    }
                }
            } catch (error) {
                console.error('認証チェックに失敗しました:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const register = useCallback(async (email: string, password: string, name: string, age: string) => {
        try {
            setLoading(true);
            const { data } = await api.post("/auth/register", {
                email,
                password,
                name,
                age: parseInt(age, 10)
            });

            const token = data.token;
            const refreshToken = data.refreshToken;
            if (token && refreshToken) {
                await SecureStore.setItemAsync('token', token);
                await SecureStore.setItemAsync('refreshToken', refreshToken);
                api.defaults.headers.common.Authorization = `Bearer ${token}`;
                setUser(data.user);
            }
        } catch (error) {
            console.error('ユーザーの新規登録に失敗しました。', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            const { data } = await api.post("/auth/login", { email, password });

            await SecureStore.setItemAsync('token', data.token);
            await SecureStore.setItemAsync('refreshToken', data.refreshToken);

            api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

            setUser(data.user);
        } catch (error) {
            console.error('ユーザーのログインに失敗しました。', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setUser(null);
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
        delete api.defaults.headers.common.Authorization;
    }, []);

    const value = useMemo(
        () => ({ user, loading, register, login, logout }),
        [user, loading, register, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}