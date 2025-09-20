import { SafeAreaView, StyleSheet, View, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import RankingFilterTabs, { FilterType } from '../components/Filter';
import RankingPeriodSelector, { PeriodType } from '../components/TimeFilter';
import RankingCardList from '../components/RankingCard';
import MyRankingFooter from '../components/MyRanking';

export function RankingPage() {
  const [filter, setFilter] = useState<FilterType>('winRate');
  const [period, setPeriod] = useState<PeriodType>('yesterday');

  // 内部で使う型に変換（winRate → winrate）
  const rankingType = useMemo(() => {
    return filter === 'winRate' ? 'winrate' : 'steps';
  }, [filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <RankingFilterTabs value={filter} onChange={setFilter} />
        <RankingPeriodSelector value={period} onChange={setPeriod} />
        <ScrollView>
          <RankingCardList type={rankingType} period={period} />
        </ScrollView>
        <MyRankingFooter type={rankingType} period={period} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1C2024',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});