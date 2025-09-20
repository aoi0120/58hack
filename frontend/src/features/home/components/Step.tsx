import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useHealthData, useTotalSteps } from '../../../hooks/useHealthData';
import { useTotalWins } from '../../../hooks/useWinRateData';
import { useTotalStep } from '../context/TotalStep';
import LevelUpCelebration from '../components/Effect';

export default function StepCard() {
  const { steps: todaySteps, loading, error, refetch } = useHealthData();
  const { totalSteps } = useTotalSteps();
  const { totalWins } = useTotalWins();

  const {
    checkLevelUp,
    showLevelUp,
    setShowLevelUp,
  } = useTotalStep();

  useEffect(() => {
    if (!loading && !error) {
      checkLevelUp();
    }
  }, [todaySteps, totalSteps, totalWins, checkLevelUp, loading, error]);

  const formatSteps = (stepCount: number) => {
    return stepCount.toLocaleString('ja-JP');
  };

  if (showLevelUp) {
    return <LevelUpCelebration onClose={() => setShowLevelUp(false)} />;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>今日の歩数</Text>
      <View style={styles.stepRow}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : error ? (
          <TouchableOpacity onPress={refetch} style={styles.errorContainer}>
            <Text style={styles.errorText}>エラー: {error}</Text>
            <Text style={styles.retryText}>タップして再試行</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.stepCount}>{formatSteps(todaySteps)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#3E8DFF',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 8,
  },
  stepCount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 4,
  },
  retryText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});
