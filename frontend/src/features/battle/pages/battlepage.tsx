import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BattleCard } from "../components/battlecord";
import { StepsPanel } from "../components/stepspanel";
import { BattleResultPanel } from "../components/BattleResultPanel";
import type { Opponent } from "../types";
import { useNearbyOpponents } from "@/src/hooks/useNearbyOpponents";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { useState, useEffect } from "react";

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
    const {
        opponents,
        scanning,
        error,
        resetBattleData,
        battleResult,
        setBattleResult,
    } = useNearbyOpponents();

    const { user, loading } = useAuth();
    const isAuthenticated = !!user;

    // 押した相手。これがある間は結果画面を表示（battleResult は後で埋まる）
    const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);

    const handleResultNext = () => {
        resetBattleData();
        setBattleResult(null);
        setSelectedOpponent(null);
    };

    // サーバ応答/受信で battleResult が入ったら、selectedOpponent が無ければ補完
    useEffect(() => {
        if (battleResult && !selectedOpponent) {
            setSelectedOpponent(battleResult.opponent);
        }
    }, [battleResult, selectedOpponent]);

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
            {selectedOpponent ? (
                <BattleResultPanel
                    opponent={selectedOpponent}
                    onNext={handleResultNext}
                    battleResult={battleResult || undefined}
                />
            ) : (
                <ScrollView contentContainerStyle={styles.container}>
                    <StepsPanel />
                    <Text style={styles.sectionTitle}>Bluetoothですれ違った相手</Text>

                    {opponents.length === 0 ? (
                        <Empty error={error} scanning={scanning} />
                    ) : (
                        opponents.map((op: Opponent, index: number) => (
                            <BattleCard
                                key={`${op.id}-${index}`}
                                opponent={op}
                                onPress={(o) => {
                                    console.log("[UI] press battle", o.id);
                                    // 接続・交換は自動。ここでは選択のみ
                                    setSelectedOpponent(o);
                                }}
                            />
                        ))
                    )}

                    <View style={{ height: 24 }} />
                </ScrollView>
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
        fontSize: 14
    },
});