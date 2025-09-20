import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export type FilterType = 'winRate' | 'steps';

export default function RankingFilterTabs({
  value,
  onChange,
}: {
  value: FilterType;
  onChange?: (filter: FilterType) => void;
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          value === 'winRate' ? styles.activeTab : styles.inactiveTab,
          styles.leftTab,
        ]}
        onPress={() => onChange?.('winRate')}
      >
        <Text
          style={[
            styles.tabText,
            value === 'winRate' ? styles.activeText : styles.inactiveText,
          ]}
        >
          勝率
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          value === 'steps' ? styles.activeTab : styles.inactiveTab,
          styles.rightTab,
        ]}
        onPress={() => onChange?.('steps')}
      >
        <Text
          style={[
            styles.tabText,
            value === 'steps' ? styles.activeText : styles.inactiveText,
          ]}
        >
          歩数
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    alignItems: 'center',
  },
  leftTab: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightTab: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFD900',
  },
  inactiveTab: {
    backgroundColor: '#2D3748',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeText: {
    color: '#000',
  },
  inactiveText: {
    color: '#fff',
  },
});