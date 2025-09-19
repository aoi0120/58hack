import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export function RegisterForm() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // const { register } = useAuth();

    const onSubmit = async () => {
        setSubmitted(true);
        setError(null);

        try {
            // await register(email.trim(), password.trim(), name.trim(), age.trim());
        } catch (error: any) {
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
            />
            <Text style={styles.label}>パスワード</Text>
            <TextInput
                placeholder="パスワード"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />
            <Text style={styles.label}>パスワード確認</Text>
            <TextInput
                placeholder="パスワード確認"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
            />
            <TouchableOpacity
                onPress={onSubmit}
                style={styles.button}
            >
                <Text style={styles.buttonText}>新規登録</Text>
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
});
