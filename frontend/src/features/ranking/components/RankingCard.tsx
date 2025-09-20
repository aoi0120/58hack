import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

type StepsRanking = { rank: number; name: string; steps: number };
type WinrateRanking = { rank: number; name: string; winRate: number }; 
type Props = { type: 'steps' | 'winrate'; period: 'yesterday' | 'week' };

export default function RankingCardList({ type, period }: Props) {
  const [rows, setRows] = useState<Array<StepsRanking | WinrateRanking>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const now = new Date();
    const endDate =
      period === 'yesterday'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        : now;
    const daysCount = period === 'yesterday' ? 1 : 7;
    const dateISO = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    ).toISOString();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const url = type === 'steps' ? '/ranking/steps' : '/ranking/winrate';
        const res = await api.post<any[]>(url, { date: dateISO, daysCount }, { signal: controller.signal, validateStatus: () => true });

        if (res.status >= 200 && res.status < 300 && Array.isArray(res.data)) {
          const mapped =
            type === 'steps'
              ? res.data
                  .map((r, i) => ({
                    rank: Number(r.rank ?? i + 1),
                    name: String(r.user?.name ?? 'unknown'),
                    steps: Number(r.steps ?? 0),
                  }))
                  .sort((a, b) => a.rank - b.rank)
              : res.data
                  .map((r, i) => ({
                    rank: Number(r.rank ?? i + 1),
                    name: String(r.user?.name ?? 'unknown'),
                    winRate: Math.round(Number(r.winRate ?? 0) * 100),
                  }))
                  .sort((a, b) => a.rank - b.rank);

          setRows(mapped);
        } else if (res.status === 401) {
          setRows([]); setError('未ログインです');
        } else if (res.status === 404) {
          setRows([]); setError('ランキングAPIが見つかりません');
        } else {
          setRows([]); setError(`取得エラー: ${res.status}`);
        }
      } catch (e: any) {
        if (e?.name !== 'CanceledError') {
          console.warn('ランキング取得失敗:', e);
          setRows([]); setError('ランキングの取得に失敗しました');
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [type, period]);

  const rankings = useMemo(() => rows.filter((u) => u.rank <= 10), [rows]);

  return (
    <View style={styles.list}>
      {error ? (
        <Text style={{ color: '#E53E3E', marginBottom: 8, fontWeight: 'bold' }}>{error}</Text>
      ) : loading && rankings.length === 0 ? (
        <Text style={{ color: '#999', marginBottom: 8 }}>読み込み中...</Text>
      ) : null}

      {rankings.map((user) => {
        const isTop3 = user.rank <= 3;
        const rankColor =
          user.rank === 1 ? '#FFD700' :
          user.rank === 2 ? '#A9A9A9' :
          user.rank === 3 ? '#DAA520' : '#666';
        const textColor = isTop3 ? '#fff' : '#aaa';
        const valueText =
          type === 'steps'
            ? `${'steps' in user ? user.steps : '-'}歩`
            : `${'winRate' in user ? user.winRate : '-'}%`;

        return (
          <View key={`${type}-${period}-${user.rank}-${user.name}`} style={[styles.card, !isTop3 && styles.cardMuted]}>
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
  list: { paddingBottom: 140 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, backgroundColor: '#2D3748', borderWidth: 4, borderColor: '#000',
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, marginBottom: 12,
  },
  cardMuted: { backgroundColor: 'rgba(45, 55, 72, 0.7)', borderColor: 'rgba(0,0,0,0.5)' },
  rankCircle: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#000',
    justifyContent: 'center', alignItems: 'center',
  },
  rankText: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  name: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  valueBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#FFD900' },
  colon: { fontSize: 14, fontWeight: 'bold', color: '#FFD900' },
  value: { fontSize: 18, fontWeight: 'bold', color: '#FFD900' },
});
