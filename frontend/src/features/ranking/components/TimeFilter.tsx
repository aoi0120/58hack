import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export type PeriodType = 'yesterday' | 'week';

export default function RankingPeriodSelector({
  value,
  onChange,
}: {
  value: PeriodType;
  onChange?: (period: PeriodType) => void;
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.leftButton,
            value === 'yesterday' ? styles.active : styles.inactive,
          ]}
          onPress={() => onChange?.('yesterday')}
        >
          <Text
            style={[
              styles.text,
              value === 'yesterday' ? styles.activeText : styles.inactiveText,
            ]}
          >
            昨日
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.rightButton,
            value === 'week' ? styles.active : styles.inactive,
          ]}
          onPress={() => onChange?.('week')}
        >
          <Text
            style={[
              styles.text,
              value === 'week' ? styles.activeText : styles.inactiveText,
            ]}
          >
            一週間
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#2D3748',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderColor: '#000',
  },
  leftButton: {
    borderRightWidth: 2,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightButton: {
    borderLeftWidth: 2,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  active: {
    backgroundColor: '#3E8DFF',
  },
  inactive: {
    backgroundColor: '#2D3748',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeText: {
    color: '#fff',
  },
  inactiveText: {
    color: '#fff',
  },
});