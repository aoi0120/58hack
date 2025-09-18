import { View, Text, StyleSheet } from 'react-native';

export default function CalorieCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.caption}>今日の消費カロリー：カレー相当🍛</Text>
      <View style={styles.row}>
        <Text style={styles.kcal}>345 kcal</Text>
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
});