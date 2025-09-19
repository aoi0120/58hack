import { LoginForm } from "@/src/features/auth/components/LoginForm";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1C2024' }}>
            <LoginForm />
        </SafeAreaView>
    );
}