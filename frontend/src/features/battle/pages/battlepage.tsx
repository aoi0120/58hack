import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { BattleCard } from "../components/battlecord";
import { StepsPanel } from "../components/stepspanel";
import { BattleResultPanel } from "../components/BattleResultPanel";
import { LevelUpPanel } from "../components/LevelUpPanel";
import type { Opponent } from "../types";
import { useNearbyOpponents } from "@/src/hooks/useNearbyOpponents";
import { useAuth } from "@/src/features/auth/context/AuthContext";

const BG = "#1F242B";

const Empty = ({ error, scanning }: { error: string | null; scanning: boolean }) => (
    <View style={styles.emptyWrap}>
        {error ? (
            <Text style={styles.errorText}>{error}</Text>
        ) : scanning ? (
            <>
                <ActivityIndicator />
                <Text style={styles.emptyText}>近くの相手を探しています…</Text>
            </>
        ) : (
            <>
                <Text style={styles.emptyText}>近くに相手がいません</Text>
                <Text style={styles.emptySubText}>Bluetoothをオンにして待機中...</Text>
            </>
        )}
    </View>
);

export function BattlePage() {
    const { opponents, scanning, error, resetBattleData, battleResult, setBattleResult } = useNearbyOpponents();
    const { user, loading } = useAuth();
    const isAuthenticated = !!user;

    const [step, setStep] = useState<"list" | "result" | "levelup">("list");
    const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);

    const onBattle = (op: Opponent) => {
        setSelectedOpponent(op);
        setStep("result");
    };

    const handleResultNext = (winner: "me" | "opponent") => {
        setStep("list");
        // バトルデータをリセット
        resetBattleData();
        setBattleResult(null);
        setSelectedOpponent(null);
    };

    // バトル結果が発生したら結果画面を表示
    useEffect(() => {
        if (battleResult) {
            setSelectedOpponent(battleResult.opponent);
            setStep("result");
        }
    }, [battleResult]);


    if (loading) {
        return (
            <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.emptyWrap}>
                        <ActivityIndicator />
                        <Text style={styles.emptyText}>認証状態を確認中...</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.emptyWrap}>
                        <Text style={styles.errorText}>ログインが必要です</Text>
                        <Text style={styles.retryText}>ログインしてから再度お試しください</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            {step === "list" && (
                <ScrollView contentContainerStyle={styles.container}>
                    <StepsPanel />
                    <Text style={styles.sectionTitle}>Bluetoothですれ違った相手</Text>

                    {opponents.length === 0 ? (
                        <Empty error={error} scanning={scanning} />
                    ) : (
                        opponents.map((op: Opponent, index: number) => (
                            <BattleCard key={`${op.id}-${index}`} opponent={op} onPress={onBattle} />
                        ))
                    )}

                    <View style={{ height: 24 }} />
                </ScrollView>
            )}

            {step === "result" && selectedOpponent && (
                <BattleResultPanel
                    opponent={selectedOpponent}
                    onNext={handleResultNext}
                    battleResult={battleResult ? {
                        winner: battleResult.winner,
                        mySteps: battleResult.mySteps,
                        opponentSteps: battleResult.opponentSteps
                    } : undefined}
                />
            )}

            {step === "levelup" && (
                <LevelUpPanel onClose={() => setStep("list")} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    container: { padding: 16 },
    sectionTitle: {
        color: "#E6EDF7",
        fontSize: 18,
        textAlign: "center",
        marginVertical: 8,
    },
    emptyWrap: {
        padding: 20,
        marginTop: 14,
        borderRadius: 16,
        borderWidth: 4,
        borderColor: "#000",
        backgroundColor: "#2B3545",
        alignItems: "center",
        gap: 8,
    },
    emptyText: { color: "#AAB7C8", fontSize: 16 },
    emptySubText: { color: "#7A8A9A", fontSize: 14 },
    errorText: {
        color: "#FF6B6B",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 8,
    },
    retryText: {
        color: "#AAB7C8",
        fontSize: 14,
        textAlign: "center",
    },
});