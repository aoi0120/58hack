import { useEffect, useState } from 'react';
import { fetchWinRateRanking, fetchTotalWins } from '../../lib/api';
import * as SecureStore from 'expo-secure-store';

type WinRateRankingItem = {
  rank: number;
  winRate: number;
  user: {
    id: string;
    name: string;
  };
};

export const useWeeklyWinRateData = () => {
  const [winRate, setWinRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const ranking: WinRateRankingItem[] = await fetchWinRateRanking(7);
        const myUserId = await SecureStore.getItemAsync('userId');
        const me = ranking.find((r) => r.user.id === myUserId);
        setWinRate(me?.winRate ?? 0);
      } catch (err) {
        setError('勝率取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { winRate, loading, error };
};

export const useYesterdayWinRateData = () => {
  const [winRate, setWinRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const ranking: WinRateRankingItem[] = await fetchWinRateRanking(1);
        const myUserId = await SecureStore.getItemAsync('userId');
        const me = ranking.find((r) => r.user.id === myUserId);
        setWinRate(me?.winRate ?? 0);
      } catch (err) {
        setError('勝率取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { winRate, loading, error };
};

export const useTotalWins = () => {
  const [totalWins, setTotalWins] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const wins = await fetchTotalWins();
        setTotalWins(wins);
      } catch (err) {
        setError('勝利数の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { totalWins, loading, error };
};
