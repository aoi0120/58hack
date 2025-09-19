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
        throw new Error('合うコンテキストが見つかりません。');
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
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setUser({
                            id: payload.id,
                            email: payload.email || '',
                            name: payload.name || '',
                            age: payload.age || 0
                        });
                    } catch (decodeError) {
                        console.error('トークンのデコードに失敗しました:', decodeError);
                        await SecureStore.deleteItemAsync('token');
                    }
                }
            } catch (error) {
                console.error('ユーザー情報の取得に失敗しました。', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const register = useCallback(async (email: string, password: string, name: string, age: string) => {
        try {
            setLoading(true);
            const { data } = await api.post("/auth/register", { email, password, name, age });
            setUser(data.user);
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

            const payload = JSON.parse(atob(data.token.split('.')[1]));
            setUser({
                id: payload.id,
                email: email,
                name: payload.name || '',
                age: payload.age || 0
            });
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