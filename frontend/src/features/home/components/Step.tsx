import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useHealthData } from '../../../hooks/useHealthData';

export default function StepCard() {
    const { steps, loading, error, refetch } = useHealthData();

    const formatSteps = (stepCount: number) => {
        return stepCount.toLocaleString('ja-JP');
    };

    return (
        <View style={styles.card}>
            <Text style={styles.label}>今日の歩数</Text>
            <View style={styles.stepRow}>
                {loading ? (
                    <ActivityIndicator size="large" color="#fff" />
                ) : error ? (
                    <TouchableOpacity onPress={refetch} style={styles.errorContainer}>
                        <Text style={styles.errorText}>エラー: {error}</Text>
                        <Text style={styles.retryText}>タップして再試行</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.stepCount}>{formatSteps(steps)}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#3E8DFF', // game-blue
        borderWidth: 4,
        borderColor: '#000',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
        textAlign: 'center',
    },
    stepRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'baseline',
        gap: 8,
    },
    stepCount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    errorContainer: {
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#ff6b6b',
        textAlign: 'center',
        marginBottom: 4,
    },
    retryText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
});