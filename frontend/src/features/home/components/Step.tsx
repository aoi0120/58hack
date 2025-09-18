import { View, Text, StyleSheet } from 'react-native';

export default function StepCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>今日の歩数</Text>
      <View style={styles.stepRow}>
        <Text style={styles.stepCount}>12,345</Text>
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
});