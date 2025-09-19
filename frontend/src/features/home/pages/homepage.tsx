import { SafeAreaView } from 'react-native-safe-area-context';

import Step from '../components/Step';
import Level from '../components/Level';
import Calorie from '../components/Calorie';
import Avatar from '../components/Avatar';

export function HomePage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C2024' }}>
      <Level />
      <Step />
      <Calorie />
      <Avatar />
    </SafeAreaView>
  );
}