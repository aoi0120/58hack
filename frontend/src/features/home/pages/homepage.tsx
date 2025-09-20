import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import Step from '../components/Step';
import Level from '../components/Level';
import Calorie from '../components/Calorie';
import Avatar from '../components/Avatar';
import { LevelUpPanel } from '../../battle/components/LevelUpPanel';
import { useTotalStep } from '../context/TotalStep';

export function HomePage() {
    const { showLevelUp, setShowLevelUp, forceLevelUp, totalStep, userLevel, levelInfo } = useTotalStep();

    const handleForceLevelUp = () => {
        console.log('強制レベルアップボタンが押されました');
        console.log('現在の状態:', { totalStep, userLevel, calculatedLevel: levelInfo.level });
        forceLevelUp();
    };

    if (showLevelUp) {
        return (
            <LevelUpPanel onClose={() => setShowLevelUp(false)} />
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1C2024' }}>
            <Level />
            <Step />
            <Calorie />
            <Avatar />

            {/* デバッグ用のテストボタン */}
            <View style={styles.debugContainer}>
                <Text style={styles.debugText}>
                    歩数:{totalStep}{'\n'}DB:{userLevel} 計算:{levelInfo.level}
                </Text>
                <TouchableOpacity style={styles.testButton} onPress={handleForceLevelUp}>
                    <Text style={styles.testButtonText}>レベルアップ</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    debugContainer: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 100,
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: 10,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#F8D94E',
    },
    debugText: {
        color: 'white',
        fontSize: 10,
        marginBottom: 8,
        textAlign: 'center',
    },
    testButton: {
        backgroundColor: '#F8D94E',
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        minHeight: 40,
        justifyContent: 'center',
    },
    testButtonText: {
        color: '#1C2024',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
});