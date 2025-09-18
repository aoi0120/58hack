import { useEffect } from "react";
import { useRouter } from "expo-router";


export default function Index() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            const isLoggedIn = true;
            if (isLoggedIn) {
                router.replace("/(tabs)");
            } else {
                router.replace("/(auth)/login");
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return null;
}