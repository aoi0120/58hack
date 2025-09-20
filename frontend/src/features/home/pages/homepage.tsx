import { SafeAreaView } from 'react-native-safe-area-context';

import Step from '../components/Step';
import Level from '../components/Level';
import Calorie from '../components/Calorie';
import Avatar from '../components/Avatar';
import { LevelUpPanel } from '../../battle/components/LevelUpPanel';
import { useTotalStep } from '../context/TotalStep';

export function HomePage() {
    const { showLevelUp, setShowLevelUp } = useTotalStep();

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
        </SafeAreaView>
    );
}