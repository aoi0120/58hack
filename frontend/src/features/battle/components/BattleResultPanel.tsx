import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import type { Opponent } from '../types';
import { useTotalStep } from '../../home/context/TotalStep';

export function BattleResultPanel({
  opponent,
  onNext,
}: {
  opponent: Opponent;
  onNext: (winner: 'me' | 'opponent') => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  const [opponentSteps, setOpponentSteps] = useState<number | null>(null);
  const [displaySteps, setDisplaySteps] = useState(0);
  const [winner, setWinner] = useState<'me' | 'opponent' | null>(null);

  const mySteps = 12345;

  const { totalStep, setTotalStep, checkLevelUp } = useTotalStep();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      const fake = Math.floor(Math.random() * 100000);
      setDisplaySteps(fake);
    }, 80);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      const final = Math.floor(Math.random() * 20000);
      setDisplaySteps(final);

      setTimeout(() => {
        setOpponentSteps(final);
        const result = mySteps >= final ? 'me' : 'opponent';
        setWinner(result);

        Animated.timing(resultAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(messageAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        });
      }, 1000);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const resultText =
    winner === 'me' ? 'YOU WIN!' : winner === 'opponent' ? 'YOU LOSE...' : '';
  const resultColor =
    winner === 'me' ? '#FFD900' : winner === 'opponent' ? '#FF5252' : '#FFFFFF';

  const handleNext = async () => {
    if (winner === 'me') {
      const updatedStep = totalStep + 5000;
      setTotalStep(updatedStep);
      await checkLevelUp();
    }
    if (winner) {
      onNext(winner);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.resultBox, { opacity: fadeAnim }]}>
        <Animated.Text
          style={[
            styles.title,
            {
              color: resultColor,
              opacity: resultAnim,
            },
          ]}
        >
          {resultText}
        </Animated.Text>

        <View style={styles.statsRow}>
          <View style={styles.statsBox}>
            <Text style={styles.statsLabel}>自分</Text>
            <Text style={[styles.steps, { color: '#4CAF50' }]}>
              {mySteps.toLocaleString()}
            </Text>
            <Text style={styles.unit}>歩</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsLabel}>{opponent.name}</Text>
            <Text style={[styles.steps, { color: '#FF5252' }]}>
              {displaySteps.toLocaleString()}
            </Text>
            <Text style={styles.unit}>歩</Text>
          </View>
        </View>

        <Animated.View style={{ opacity: messageAnim, alignItems: 'center' }}>
          <Text style={styles.subtitle}>
            {winner === 'me'
              ? 'おめでとう！バトルに勝利した！'
              : '残念…バトルに敗北した'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>バトルを終える</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2024',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBox: {
    width: '90%',
    maxWidth: 360,
    alignItems: 'center',
  },
  title: {
    fontSize: 55,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 16,
    minHeight: 56,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 24,
    minHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  statsBox: {
    backgroundColor: '#2D3748',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  statsLabel: {
    fontSize: 12,
    color: '#C9D1E0',
    marginBottom: 4,
  },
  steps: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 12,
    color: '#C9D1E0',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3E8DFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
