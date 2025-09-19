import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function LoginForm() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    const onSubmit = async () => {
        setSubmitted(true);
        setError(null);

        try {
            await login(email.trim(), password.trim());
        } catch {
            setError('メールアドレスまたはパスワードが間違っています。');
        } finally {
            setSubmitted(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ログイン</Text>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
                placeholder="メールアドレス"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
            />
            <Text style={styles.label}>パスワード</Text>
            <TextInput
                placeholder="パスワード"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
                onPress={onSubmit}
                style={styles.button}
                disabled={submitted}
            >
                <Text style={styles.buttonText}>{submitted ? 'ログイン中...' : 'ログイン'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => router.push('/register')}
                style={styles.buttonRegister}
            >
                <Text style={styles.buttonRegister}>新規登録はこちら</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C2024',
        padding: 16,
        justifyContent: 'center',

    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFD900',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#3C4A5A',
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 4,
        borderColor: 'black',
        shadowColor: 'black',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    button: {
        backgroundColor: '#3E8DFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 4,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        height: 60,
    },
    buttonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonRegister: {
        color: '#3E8DFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
    },
    error: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
    },
});
