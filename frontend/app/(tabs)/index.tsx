import { SafeAreaView } from 'react-native-safe-area-context';

import Step from '../../src/features/home/components/Step';
import Level from '../../src/features/home/components/Level';
import Calorie from '../../src/features/home/components/Calorie';
import Avatar from '../../src/features/home/components/Avatar';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C2024' }}>
      <Level />
      <Step />
      <Calorie />
      <Avatar />
    </SafeAreaView>
  );
}