import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import type { Opponent } from "../types";

export function BattleResultPanel({
    opponent,
    onNext,
    battleResult,
}: {
    opponent: Opponent;
    onNext: (winner: "me" | "opponent") => void;
    battleResult?: { winner: "me" | "opponent"; mySteps: number | string; opponentSteps: number | string };
}) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const resultAnim = useRef(new Animated.Value(0)).current;
    const messageAnim = useRef(new Animated.Value(0)).current;

    const hasResult = !!battleResult;
    const myStepsNum = Number(battleResult?.mySteps ?? 0);
    const oppStepsNum = Number(battleResult?.opponentSteps ?? 0);
    const winner = battleResult?.winner ?? null;

    useEffect(() => {
        fadeAnim.setValue(0);
        resultAnim.setValue(0);
        messageAnim.setValue(0);

        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
            Animated.timing(resultAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start(() => {
                Animated.timing(messageAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
            });
        });
    }, [battleResult, fadeAnim, resultAnim, messageAnim]);

    const resultText = !hasResult ? "..." : winner === "me" ? "YOU WIN!" : "YOU LOSE...";
    const resultColor = !hasResult ? "#FFFFFF" : winner === "me" ? "#FFD900" : "#FF5252";

    const handleNext = () => { if (winner) onNext(winner); };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.resultBox, { opacity: fadeAnim }]}>
                <Animated.Text style={[styles.title, { color: resultColor, opacity: resultAnim }]}>
                    {resultText}
                </Animated.Text>

                <View style={styles.statsRow}>
                    <View style={styles.statsBox}>
                        <Text style={styles.statsLabel}>自分</Text>
                        <Text style={[styles.steps, { color: "#4CAF50" }]}>
                            {hasResult ? myStepsNum.toLocaleString() : "—"}
                        </Text>
                        <Text style={styles.unit}>歩</Text>
                    </View>
                    <View style={styles.statsBox}>
                        <Text style={styles.statsLabel}>{opponent.name}</Text>
                        <Text style={[styles.steps, { color: "#FF5252" }]}>
                            {hasResult ? oppStepsNum.toLocaleString() : "—"}
                        </Text>
                        <Text style={styles.unit}>歩</Text>
                    </View>
                </View>

                <Animated.View style={{ opacity: messageAnim, alignItems: "center" }}>
                    <Text style={styles.subtitle}>
                        {!hasResult ? "結果を集計中..." :
                            winner === "me" ? "おめでとう！バトルに勝利した！" : "残念…バトルに敗北した"}
                    </Text>
                    {hasResult && (
                        <TouchableOpacity style={styles.button} onPress={handleNext}>
                            <Text style={styles.buttonText}>バトルを終える</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#1C2024", justifyContent: "center", alignItems: "center" },
    resultBox: { width: "90%", maxWidth: 360, alignItems: "center" },
    title: { fontSize: 55, fontWeight: "bold", letterSpacing: 1.5, marginBottom: 16, minHeight: 56 },
    subtitle: { fontSize: 14, color: "#FFFFFF", marginBottom: 24, minHeight: 20 },
    statsRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 24 },
    statsBox: {
        backgroundColor: "#2D3748",
        borderWidth: 4,
        borderColor: "#000",
        borderRadius: 12,
        padding: 12,
        width: "48%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
    },
    statsLabel: { fontSize: 12, color: "#C9D1E0", marginBottom: 4 },
    steps: { fontSize: 28, fontWeight: "bold" },
    unit: { fontSize: 12, color: "#C9D1E0", marginTop: 4 },
    button: {
        backgroundColor: "#3E8DFF",
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#000",
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
    },
    buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});