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
                const token = SecureStore.getItem('token');
                if (token) {
                    const { data } = await api.get("");

                    setUser(data);
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
            const { data } = await api.post("", { email, password, name, age });
            setUser(data);
        } catch (error) {
            console.error('ユーザーの新規登録に失敗しました。', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            const { data } = await api.post("", { email, password });
            setUser(data);
        } catch (error) {
            console.error('ユーザーのログインに失敗しました。', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        SecureStore.deleteItemAsync('token');
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