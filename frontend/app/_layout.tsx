import { Stack } from "expo-router";
import { AuthProvider } from "@/src/features/auth/context/AuthContext";
import { TotalStepProvider } from "@/src/features/home/context/TotalStep";

export default function RootLayout() {
    return (
        <AuthProvider>
            <TotalStepProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </TotalStepProvider>
        </AuthProvider>
    );
}