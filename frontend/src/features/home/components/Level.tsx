import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useTotalStep } from '../context/TotalStep';
import { calculateLevel } from '@/src/utils/levelUtils';

export default function LevelBar() {
    const { totalStep, checkLevelUp } = useTotalStep();
    const levelInfo = calculateLevel(totalStep);

    // 歩数が更新された時にレベルアップをチェック
    useEffect(() => {
        console.log('Level.tsx - レベルアップチェック実行:', { totalStep });
        if (totalStep > 0) {
            checkLevelUp();
        }
    }, [totalStep, checkLevelUp]);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>Lv.</Text>
                <Text style={styles.level}>{levelInfo.level}</Text>
                <View style={styles.bar}>
                    <View
                        style={[
                            styles.fill,
                            { width: `${levelInfo.progressPercentage}%` }
                        ]}
                    />
                </View>
            </View>
            <Text style={styles.caption}>
                あと <Text style={styles.highlight}>{levelInfo.stepsRemaining.toLocaleString()}</Text> 歩でレベルアップ
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2D3748',
        borderWidth: 4,
        borderColor: '#000',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFD900', // game-yellow
    },
    level: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    bar: {
        flex: 1,
        height: 16,
        backgroundColor: '#4B5563', // gray-600
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#000',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        width: '60%',
        backgroundColor: '#FFD900',
    },
    caption: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'right',
    },
    highlight: {
        color: '#FFD900',
    },
});