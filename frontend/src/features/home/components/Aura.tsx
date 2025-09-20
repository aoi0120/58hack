import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

const Aura: React.FC<{ intensity: number }> = ({ intensity }) => {
  const clamped = Math.max(0, Math.min(intensity, 4));

  // 段階ごとの設定
  const radiusLevels = [20, 30, 40, 50, 60];
  const opacityLevels = [0.1, 0.25, 0.4, 0.55, 0.7];
  const colorLevels = ['#3E8DFF', '#00BFFF', '#00FFAA', '#FFD700', '#FF3C00'];

  const radius = radiusLevels[clamped];
  const opacity = opacityLevels[clamped];
  const shadowColor = colorLevels[clamped];

  const anim = useRef(new Animated.Value(0)).current;
  const [path, setPath] = useState<string>('');
  const prevNoise = useRef({ x: 0, y: 0 });
  const nextNoise = useRef({ x: 0, y: 0 });
  const prevWidth = useRef(0);
  const nextWidth = useRef(0);
  const lastValue = useRef(0);

  const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

  useEffect(() => {
    const generateNextNoise = () => {
      prevNoise.current = nextNoise.current;
      nextNoise.current = {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100,
      };
      prevWidth.current = nextWidth.current;
      nextWidth.current = Math.random() * 30;
    };

    generateNextNoise();

    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    const listener = anim.addListener(({ value }) => {
      if (value < lastValue.current) {
        generateNextNoise();
      }
      lastValue.current = value;

      const t = value;

      // サイズ倍率（段階ごとに拡大）
      const scale = 1 + clamped * 0.2;

      // 横方向ノイズ
      const topX = 200 + lerp(prevNoise.current.x, nextNoise.current.x, t) * scale;

      // 縦方向ノイズ（高さを強調）
      const baseTopY = -60 - clamped * 40; // 👈 段階ごとに上へ引き上げる
      const topY = baseTopY + lerp(prevNoise.current.y, nextNoise.current.y, t) * scale;

      // 横幅の広がり
      const baseWidth = 10 + clamped * 20; // 👈 段階ごとに広げる
      const widthOffset = lerp(prevWidth.current, nextWidth.current, t) * scale;

      const leftX = 200 - baseWidth - widthOffset;
      const rightX = 200 + baseWidth + widthOffset;
      const bottomY = 450;

      const d = `
        M${leftX},${bottomY}
        Q${topX},${topY} ${rightX},${bottomY}
        Q${rightX},${bottomY + 60} 200,${bottomY + 90}
        Q${leftX},${bottomY + 60} ${leftX},${bottomY}
        Z
      `;
      setPath(d);
    });

    return () => {
      anim.removeListener(listener);
    };
  }, [anim, clamped]);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* 背景シャドウオーラ */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          borderRadius: 200,
          opacity,
          shadowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: opacity,
          shadowRadius: radius,
          zIndex: -1,
        }}
      />

      {/* 炎のようなSVGオーラ */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -180,
          left: 0,
          width: 500,
          height: 600,
          zIndex: 4,
          opacity: 0.2 + clamped * 0.1,
          pointerEvents: 'none',
        }}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="flameGrad" x1="0.5" y1="0.5" x2="0.5" y2="1">
              <Stop offset="0%" stopColor="#FF3C00" stopOpacity={0.95} />
              <Stop offset="20%" stopColor="#FF6A00" stopOpacity={0.5} />
              <Stop offset="40%" stopColor="#FFA500" stopOpacity={0.2} />
              <Stop offset="60%" stopColor="#FFD700" stopOpacity={0.05} />
              <Stop offset="80%" stopColor="#FFD700" stopOpacity={0.01} />
              <Stop offset="100%" stopColor="#FFD700" stopOpacity={0.001} />
            </LinearGradient>
          </Defs>
          <Path d={path || ''} fill="url(#flameGrad)" />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default Aura;