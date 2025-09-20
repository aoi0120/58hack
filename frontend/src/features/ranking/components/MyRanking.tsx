import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useWeeklyHealthData, useYesterdayHealthData } from '../../../hooks/useHealthData';

type Props = {
  type: 'steps' | 'winrate';
  period: 'yesterday' | 'week';
};

export default function MyRankingFooter({ type, period }: Props) {
  const { steps: weeklySteps, loading: loadingWeekly } = useWeeklyHealthData();
  const { steps: yesterdaySteps, loading: loadingYesterday } = useYesterdayHealthData();

  const myRanking = useMemo(() => {
    if (type === 'steps' && period === 'yesterday') {
      return {
        rank: 128,
        name: 'あなた',
        steps: loadingYesterday ? undefined : yesterdaySteps,
      };
    }
    if (type === 'steps' && period === 'week') {
      return {
        rank: 11,
        name: 'あなた',
        steps: loadingWeekly ? undefined : weeklySteps,
      };
    }
    if (type === 'winrate' && period === 'yesterday') {
      return { rank: 128, name: 'あなた', winRate: 42 };
    }
    if (type === 'winrate' && period === 'week') {
      return { rank: 12, name: 'あなた', winRate: 61 };
    }
    return null;
  }, [type, period, weeklySteps, loadingWeekly, yesterdaySteps, loadingYesterday]);

  if (!myRanking) return null;

  const rankText = myRanking.rank != null ? `${myRanking.rank}` : '-';
  const valueText =
    type === 'steps'
      ? (period === 'yesterday' ? loadingYesterday : loadingWeekly)
        ? '読み込み中...'
        : myRanking.steps != null
          ? `${myRanking.steps.toLocaleString()}歩`
          : '-歩'
      : `${myRanking.winRate ?? '-'}%`;

  return (
    <View style={styles.footer}>
      <View style={styles.card}>
        <View style={styles.rankCircle}>
          <Text style={styles.rankText}>{rankText}</Text>
        </View>
        <Text style={styles.name}>{myRanking.name}</Text>
        <View style={styles.valueBox}>
          <Text style={styles.label}>{type === 'steps' ? '歩数' : '勝率'}</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{valueText}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3E8DFF',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  rankCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD900',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  valueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  colon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD900',
  },
});