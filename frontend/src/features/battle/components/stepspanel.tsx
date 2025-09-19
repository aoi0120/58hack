import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useYesterdayHealthData } from "../../../hooks/useHealthData";
import { sendYesterdaySteps } from "../../../../lib/api";
import { useEffect, useState, useCallback } from "react";

const PLATE = "#2B3545";
const YELLOW = "#F8D94E";

export function StepsPanel() {
    const { steps: yesterdaySteps, loading, error, refetch } = useYesterdayHealthData();
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    const syncYesterdaySteps = useCallback(async () => {
        if (yesterdaySteps === 0) return;

        try {
            setSyncing(true);
            setSyncError(null);
            await sendYesterdaySteps(yesterdaySteps);
            console.log('昨日の歩数データを送信しました:', yesterdaySteps);
        } catch (error) {
            console.error('昨日の歩数データ送信エラー:', error);
            setSyncError('データの送信に失敗しました');
        } finally {
            setSyncing(false);
        }
    }, [yesterdaySteps]);

    useEffect(() => {
        if (yesterdaySteps > 0 && !loading) {
            syncYesterdaySteps();
        }
    }, [yesterdaySteps, loading, syncYesterdaySteps]);

    return (
        <View style={styles.panel}>
            <Text style={styles.caption}>自分の昨日の歩数</Text>
            <View style={styles.stepsRow}>
                {loading ? (
                    <ActivityIndicator size="large" color={YELLOW} />
                ) : error ? (
                    <TouchableOpacity onPress={refetch} style={styles.errorContainer}>
                        <Text style={styles.errorText}>エラー: {error}</Text>
                        <Text style={styles.retryText}>タップして再試行</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <Text style={styles.stepsValue}>{yesterdaySteps.toLocaleString()}</Text>
                        <Text style={styles.stepsUnit}>歩</Text>
                    </>
                )}
            </View>
            {syncing && (
                <Text style={styles.syncText}>データを送信中...</Text>
            )}
            {syncError && (
                <Text style={styles.syncErrorText}>{syncError}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    panel: {
        backgroundColor: PLATE,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 1,
        shadowRadius: 0,
        shadowOffset: { width: 5, height: 5 },
        elevation: 6,
        borderWidth: 5,
        borderColor: "black",
    },
    caption: {
        color: "#C9D1E0",
        textAlign: "center",
        marginBottom: 8,
        fontSize: 14,
    },
    stepsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "baseline",
    },
    stepsValue: {
        color: YELLOW,
        fontSize: 44,
        fontWeight: "900",
        letterSpacing: 1.5,
    },
    stepsUnit: {
        color: "#C9D1E0",
        marginLeft: 8,
        fontSize: 16,
    },
    errorContainer: {
        alignItems: 'center',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 4,
    },
    retryText: {
        color: '#C9D1E0',
        fontSize: 12,
        textAlign: 'center',
    },
    syncText: {
        color: YELLOW,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    syncErrorText: {
        color: '#ff6b6b',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
});
