import { View, Text, Image, StyleSheet } from 'react-native';

const rankings = [
  { rank: 1, name: 'そこら辺のマッチョ', winRate: '92%', avatar: 'https://...' },
  { rank: 2, name: 'プロテインゴリラ', winRate: '88%' },
  { rank: 3, name: '筋肉ニキ', winRate: '85%' },
  { rank: 4, name: 'ウォーキングマン', winRate: '76%' },
  { rank: 5, name: 'ヘルシー志向', winRate: '71%' },
  { rank: 6, name: '健康オタク', winRate: '68%' },
  { rank: 7, name: 'ランニング侍', winRate: '65%' },
  { rank: 8, name: 'フィットネス番長', winRate: '63%' },
  { rank: 9, name: '筋トレ初心者', winRate: '60%' },
  { rank: 10, name: '歩く哲学者', winRate: '58%' },
];

export default function RankingCardList() {
  return (
    <View style={styles.list}>
      {rankings.map((user) => {
        const isTop3 = user.rank <= 3;
        const rankColor =
          user.rank === 1
            ? '#FFD700'
            : user.rank === 2
            ? '#A9A9A9'
            : user.rank === 3
            ? '#DAA520'
            : '#666';
        const textColor = isTop3 ? '#fff' : '#aaa';

        return (
          <View
            key={user.rank}
            style={[styles.card, !isTop3 && styles.cardMuted]}
          >
            <View
              style={[styles.rankCircle, { backgroundColor: rankColor }]}
            >
              <Text style={styles.rankText}>{user.rank}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
                {user.name}
              </Text>
              <View style={styles.winRateRow}>
                <Text style={styles.winRateLabel}>勝率</Text>
                <Text style={styles.winRateColon}>:</Text>
                <Text style={styles.winRateValue}>{user.winRate}</Text>
              </View>
            </View>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 140, // フッターと重ならないように
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2D3748',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginBottom: 12,
  },
  cardMuted: {
    backgroundColor: 'rgba(45, 55, 72, 0.7)',
    borderColor: 'rgba(0,0,0,0.5)',
  },
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  winRateRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  winRateLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD900',
  },
  winRateColon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD900',
  },
  winRateValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD900',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#666',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 28,
    color: '#ccc',
  },
});