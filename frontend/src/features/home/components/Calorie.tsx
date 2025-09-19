import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useHealthData } from '../../../hooks/useHealthData';

export default function CalorieCard() {
    const { calories, loading, error, refetch } = useHealthData();

    const getCalorie = (calories: number) => {
        if (calories < 200) return 'サラダに相当🥗';
        if (calories < 400) return 'カレーに相当🍛';
        if (calories < 600) return 'ハンバーグに相当🍔';
        return 'ピザに相当🍕';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.caption}>
                今日の消費カロリー：{getCalorie(calories)}
            </Text>
            <View style={styles.row}>
                {loading ? (
                    <ActivityIndicator size="small" color="#9CA3AF" />
                ) : error ? (
                    <TouchableOpacity onPress={refetch} style={styles.errorContainer}>
                        <Text style={styles.errorText}>エラー</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.kcal}>{calories} kcal</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        marginBottom: 16,
    },
    caption: {
        fontSize: 12,
        color: '#9CA3AF', // gray-400
        marginBottom: 4,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'baseline',
        gap: 4,
    },
    kcal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D1D5DB', // gray-300
    },
    errorContainer: {
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#ff6b6b',
        textAlign: 'center',
    },
});