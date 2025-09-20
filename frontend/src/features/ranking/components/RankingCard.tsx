import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';

type StepsRanking = {
  rank: number;
  name: string;
  steps: number;
};

type WinrateRanking = {
  rank: number;
  name: string;
  winRate: number;
};

type Props = {
  type: 'steps' | 'winrate';
  period: 'yesterday' | 'week';
};

export default function RankingCardList({ type, period }: Props) {
  const rankings: (StepsRanking | WinrateRanking)[] = useMemo(() => {
    const all = [
      { rank: 1, name: 'player1', steps: 12345, winRate: 92 },
      { rank: 2, name: 'player2', steps: 11000, winRate: 88 },
      { rank: 3, name: 'player3', steps: 9800, winRate: 85 },
      { rank: 4, name: 'player4', steps: 9400, winRate: 82 },
      { rank: 5, name: 'player5', steps: 9100, winRate: 80 },
      { rank: 6, name: 'player6', steps: 8800, winRate: 78 },
      { rank: 7, name: 'player7', steps: 8500, winRate: 76 },
      { rank: 8, name: 'player8', steps: 8200, winRate: 74 },
      { rank: 9, name: 'player9', steps: 7900, winRate: 72 },
      { rank: 10, name: 'player10', steps: 7600, winRate: 70 },
    ];
    return all.map((user) =>
      type === 'steps'
        ? { rank: user.rank, name: user.name, steps: user.steps }
        : { rank: user.rank, name: user.name, winRate: user.winRate }
    );
  }, [type, period]);

  return (
    <View style={styles.list}>
      {rankings
        .filter((user) => user.rank <= 10)
        .map((user) => {
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
          const valueText =
            type === 'steps'
              ? `${'steps' in user ? user.steps : '-'}歩`
              : `${'winRate' in user ? user.winRate : '-'}%`;

          return (
            <View
              key={user.rank}
              style={[styles.card, !isTop3 && styles.cardMuted]}
            >
              <View style={[styles.rankCircle, { backgroundColor: rankColor }]}>
                <Text style={styles.rankText}>{user.rank}</Text>
              </View>
              <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
                {user.name}
              </Text>
              <View style={styles.valueBox}>
                <Text style={styles.label}>{type === 'steps' ? '歩数' : '勝率'}</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.value}>{valueText}</Text>
              </View>
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 140,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#2D3748',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  valueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD900',
  },
  colon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD900',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD900',
  },
});