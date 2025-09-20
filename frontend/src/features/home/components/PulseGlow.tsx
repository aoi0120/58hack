import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

const PulseGlow: React.FC<{
  centerX: number;
  centerY: number;
  delay?: number;
  intensity?: number;
}> = ({ centerX, centerY, delay = 0, intensity = 0 }) => {
  const clamped = Math.max(0, Math.min(intensity, 4));

  const baseSize = 150 + clamped * 20;
  const baseOpacity = 0.3 + clamped * 0.1;

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(baseOpacity)).current;

  const correctionFactor = 0.08;

  // ✅ 初期位置は centerX/Y に固定、拡大時のみ補正
  const animatedTop = Animated.add(
    centerY - baseSize / 2,
    Animated.multiply(Animated.subtract(scale, 1), baseSize * correctionFactor)
  );
  const animatedLeft = Animated.add(
    centerX - baseSize / 2,
    Animated.multiply(Animated.subtract(scale, 1), baseSize * correctionFactor)
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.25 + clamped * 0.1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: baseOpacity + 0.2,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.35 + clamped * 0.1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: baseOpacity - 0.1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, [delay, opacity, scale, clamped, baseOpacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: animatedTop,
        left: animatedLeft,
        width: baseSize,
        height: baseSize,
        borderRadius: baseSize / 2,
        overflow: 'hidden',
        transform: [{ scale }],
        opacity,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="40%" stopColor="#dde4edff" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#d4dbe4ff" stopOpacity={0.2} />
          </RadialGradient>
        </Defs>
        <Circle cx="50%" cy="50%" r="50%" fill="url(#pulseGrad)" />
      </Svg>
    </Animated.View>
  );
};

export default PulseGlow;