import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const Sparkle: React.FC<{ count: number; maxSize: number }> = ({ count, maxSize }) => {
  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * 300,
      y: Math.random() * 300,
      size: Math.random() * maxSize * 0.6 + maxSize * 0.4,
      delay: Math.random() * 1000,
      opacity: new Animated.Value(0.05),
    }))
  ).current;

  useEffect(() => {
    particles.forEach(p => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.opacity, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0.05,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [particles]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: p.y,
            left: p.x,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: '#FFFFF0',
            opacity: p.opacity,
            shadowColor: '#FFFFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: Math.min(0.2 + p.size / 20, 0.6),
            shadowRadius: p.size * 3.5,
            zIndex: 2,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 300,
    height: 300,
    top: 50,
    left: 40,
    zIndex: 4,
  },
});

export default Sparkle;