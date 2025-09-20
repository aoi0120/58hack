import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateLevel, getLevelUpInfo } from '@/src/utils/levelUtils';
import { useTotalStep } from '../../home/context/TotalStep';

interface LevelUpPanelProps {
    onClose: () => void;
}

export function LevelUpPanel({ onClose }: LevelUpPanelProps) {
    const { totalStep } = useTotalStep();
    const [currentLevelInfo, setCurrentLevelInfo] = useState(calculateLevel(totalStep));
    const [showRewards, setShowRewards] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(0));
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // 2秒後に報酬を表示
        const timer = setTimeout(() => {
            setShowRewards(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const levelUpInfo = getLevelUpInfo(1, currentLevelInfo.level);

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: fadeAnim,
                    }
                ]}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>🎉 レベルアップ！</Text>
                    <Text style={styles.levelText}>レベル {currentLevelInfo.level}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>現在の歩数</Text>
                        <Text style={styles.statValue}>{currentLevelInfo.currentSteps.toLocaleString()} 歩</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>次のレベルまで</Text>
                        <Text style={styles.statValue}>{currentLevelInfo.stepsRemaining.toLocaleString()} 歩</Text>
                    </View>
                </View>

                {showRewards && (
                    <View style={styles.rewardsContainer}>
                        <Text style={styles.rewardsTitle}>🏆 獲得報酬</Text>
                        <View style={styles.rewardItem}>
                            <Text style={styles.rewardText}>✨ レベル {currentLevelInfo.level} 達成</Text>
                        </View>
                        <View style={styles.rewardItem}>
                            <Text style={styles.rewardText}>💪 体力 +10</Text>
                        </View>
                        <View style={styles.rewardItem}>
                            <Text style={styles.rewardText}>⚡ スピード +5</Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>続ける</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C2024',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: '#2D3748',
        borderRadius: 20,
        padding: 24,
        margin: 20,
        borderWidth: 4,
        borderColor: '#FFD900',
        shadowColor: '#FFD900',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD900',
        marginBottom: 8,
    },
    levelText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    statsContainer: {
        marginBottom: 24,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#4B5563',
    },
    statLabel: {
        fontSize: 16,
        color: '#A0AEC0',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFD900',
    },
    rewardsContainer: {
        marginBottom: 24,
    },
    rewardsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD900',
        marginBottom: 12,
        textAlign: 'center',
    },
    rewardItem: {
        backgroundColor: '#4B5563',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    rewardText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#FFD900',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C2024',
    },
});