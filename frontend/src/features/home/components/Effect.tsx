import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTotalSteps, useHealthData } from '../../../hooks/useHealthData';
import { useTotalWins } from '../../../hooks/useWinRateData';
import { calculateLevel } from '@/src/utils/levelUtils';

const { width, height } = Dimensions.get('window');

type FallingStar = {
  id: number;
  x: number;
  size: number;
  anim: Animated.Value;
};

export default function LevelUpCelebration({
  onClose,
}: {
  onClose: () => void;
}) {
  const { totalSteps } = useTotalSteps();
  const { steps: todaySteps } = useHealthData();
  const { totalWins } = useTotalWins();

  const winSteps = totalWins * 5000;
  const totalPoints = totalSteps + todaySteps + winSteps;
  const levelInfo = calculateLevel(totalPoints);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const levelOpacity = useRef(new Animated.Value(0)).current;
  const levelScale = useRef(new Animated.Value(1.4)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const [stars, setStars] = useState<FallingStar[]>([]);
  const [starCounter, setStarCounter] = useState(0);
  const [starIntervalActive, setStarIntervalActive] = useState(false);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      setStarIntervalActive(true);

      Animated.parallel([
        Animated.timing(levelOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(levelScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  useEffect(() => {
    if (!starIntervalActive) return;
    const interval = setInterval(() => {
      const x = Math.floor(Math.random() * (width - 48));
      const size = Math.floor(Math.random() * 24) + 16;
      const anim = new Animated.Value(-50);
      const id = starCounter;

      setStarCounter((c) => c + 1);
      setStars((prev) => [...prev, { id, x, size, anim }]);

      Animated.timing(anim, {
        toValue: height + 50,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => {
        setStars((prev) => prev.filter((s) => s.id !== id));
      });
    }, 400);

    return () => clearInterval(interval);
  }, [starIntervalActive, starCounter]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.fallingStar,
            {
              left: star.x,
              transform: [{ translateY: star.anim }],
            },
          ]}
        >
          <MaterialIcons name="star" size={star.size} color="#FFD900" />
        </Animated.View>
      ))}

      <View style={styles.levelBox}>
        <View style={styles.levelRow}>
          <Animated.Text style={[styles.levelLabel, { opacity: levelOpacity }]}>Lv.</Animated.Text>
          <Animated.Text
            style={[
              styles.levelValue,
              {
                opacity: levelOpacity,
                transform: [{ scale: levelScale }],
              },
            ]}
          >
            {levelInfo.level}
          </Animated.Text>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>
      </View>

      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>LEVEL UP!</Animated.Text>

      <Animated.View style={{ opacity: buttonOpacity }}>
        <TouchableOpacity style={styles.okButton} onPress={onClose}>
          <Text style={styles.okText}>OK</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1C2024',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallingStar: {
    position: 'absolute',
    top: 0,
  },
  levelBox: {
    backgroundColor: '#2D3748',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '90%',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD900',
    marginRight: 8,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  progressBar: {
    flex: 1,
    height: 16,
    backgroundColor: '#4B5563',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD900',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: '#FFD900',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    marginBottom: 24,
  },
  okButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  okText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
