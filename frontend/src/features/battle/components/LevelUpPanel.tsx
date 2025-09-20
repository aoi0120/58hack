import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";

export function LevelUpPanel({ onClose }: { onClose: () => void }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* レベル表示 */}
      <View style={styles.levelBox}>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Lv.</Text>
          <Text style={styles.levelValue}>26</Text>
          <View style={styles.levelBar}>
            <View style={styles.levelFill} />
          </View>
        </View>
        <Text style={styles.levelUpText}>レベルアップ！</Text>
      </View>

      {/* LEVEL UP タイトル（強調） */}
      <Animated.Text
        style={[
          styles.levelUpTitle,
          {
            transform: [{ scale: bounceAnim }],
          },
        ]}
      >
        LEVEL UP!
      </Animated.Text>

      {/* OKボタン */}
      <TouchableOpacity style={styles.button} onPress={onClose}>
        <Text style={styles.buttonText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2024",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  levelBox: {
    backgroundColor: "#2D3748",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    width: "90%",
    maxWidth: 360,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD900",
  },
  levelValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  levelBar: {
    flex: 1,
    height: 20,
    backgroundColor: "#4A5568",
    borderRadius: 10,
    overflow: "hidden",
  },
  levelFill: {
    height: "100%",
    width: "100%",
    backgroundColor: "#FFD900",
  },
  levelUpText: {
    fontSize: 12,
    color: "#C9D1E0",
    textAlign: "right",
    fontWeight: "bold",
    marginTop: 4,
  },
  levelUpTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "#FFD900",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});