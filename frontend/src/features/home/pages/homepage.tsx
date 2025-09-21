import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';

import Step from '../components/Step';
import Level from '../components/Level';
import Calorie from '../components/Calorie';
import Avatar from '../components/Avatar';
import LevelUpCelebration from '../components/Effect';

export function HomePage() {
  const [showCelebration, setShowCelebration] = useState(false);

  const handleShowCelebration = () => {
    setShowCelebration(true);
  };

  if (showCelebration) {
    return <LevelUpCelebration onClose={() => setShowCelebration(false)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C2024' }}>
      <Level />
      <Step />
      <Calorie />
      <Avatar />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.showButton} onPress={handleShowCelebration}>
          <Text style={styles.showButtonText}>演出を見る</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
  showButton: {
    backgroundColor: '#FFD900',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  showButtonText: {
    color: '#1C2024',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
