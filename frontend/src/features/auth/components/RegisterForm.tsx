import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export function RegisterForm() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { register } = useAuth();

    const validateForm = () => {
        if (!email.trim()) {
            setError('メールアドレスを入力してください。');
            return false;
        }
        if (!password.trim()) {
            setError('パスワードを入力してください。');
            return false;
        }
        if (password.length < 6) {
            setError('パスワードは6文字以上で入力してください。');
            return false;
        }
        if (password !== confirmPassword) {
            setError('パスワードが一致しません。');
            return false;
        }
        if (!name.trim()) {
            setError('名前を入力してください。');
            return false;
        }
        if (!age.trim()) {
            setError('年齢を入力してください。');
            return false;
        }
        if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
            setError('年齢を数字で入力してください。');
            return false;
        }
        return true;
    };

    const onSubmit = async () => {
        setSubmitted(true);
        setError(null);

        if (!validateForm()) {
            setSubmitted(false);
            return;
        }

        try {
            await register(email.trim(), password.trim(), name.trim(), age.trim());
            router.replace('/(tabs)');
        } catch {
            setError('入力されている情報が正しくありません。');
        } finally {
            setSubmitted(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>新規登録</Text>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
                placeholder="メールアドレス"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
            />
            <Text style={styles.label}>パスワード</Text>
            <TextInput
                placeholder="パスワード"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
            />
            <Text style={styles.label}>パスワード確認</Text>
            <TextInput
                placeholder="パスワード確認"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
            />
            <Text style={styles.label}>名前</Text>
            <TextInput
                placeholder="名前"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />
            <Text style={styles.label}>年齢</Text>
            <TextInput
                placeholder="年齢"
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                textContentType="none"
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity
                onPress={onSubmit}
                style={styles.button}
                disabled={submitted}
            >
                <Text style={styles.buttonText}>{submitted ? '登録中...' : '新規登録'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => router.push('/login')}
            >
                <Text style={styles.buttonRegister}>ログインはこちら</Text>
            </TouchableOpacity>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C2024',
        padding: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFD900',
        marginBottom: 16,
        textAlign: 'center',
        marginTop: 16,
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
        marginTop: 16,
        backgroundColor: '#3E8DFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 4,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
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
        marginTop: 20,
    },
    error: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
    },
});
