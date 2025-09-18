import { View, Text, StyleSheet } from 'react-native';

export default function LevelBar() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Lv.</Text>
        <Text style={styles.level}>25</Text>
        <View style={styles.bar}>
          <View style={styles.fill} />
        </View>
      </View>
      <Text style={styles.caption}>
        あと <Text style={styles.highlight}>4,000</Text> 歩でレベルアップ
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