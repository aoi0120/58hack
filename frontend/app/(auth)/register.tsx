import { RegisterForm } from "@/src/features/auth/components/RegisterForm"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Register() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1C2024' }}>
            <RegisterForm />
        </SafeAreaView >
    );

}