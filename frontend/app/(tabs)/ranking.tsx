import { SafeAreaView, StyleSheet, View, ScrollView } from 'react-native';
import RankingFilterTabs from '../../src/features/ranking/components/Filter';
import RankingPeriodSelector from '../../src/features/ranking/components/TimeFilter';
import RankingCardList from '../../src/features/ranking/components/RankingCard';
import MyRankingFooter from '../../src/features/ranking/components/MyRanking';

export default function RankingScreen() {
  const handlePeriodChange = (period: 'yesterday' | 'week') => {
    console.log('選択された期間:', period);
    // TODO: period に応じて表示を切り替える
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <RankingFilterTabs />
        <RankingPeriodSelector onChange={handlePeriodChange} />
        <ScrollView>
          <RankingCardList />
        </ScrollView>
        <MyRankingFooter />
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