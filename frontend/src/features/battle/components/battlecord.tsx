import { View, Text, StyleSheet, Pressable } from "react-native";
import { Opponent } from "../types";

const PLATE = "#2B3545";

const YELLOW = "#F8D94E";
const RED = "#F45C4A";

type Props = {
  opponent: Opponent;
  onPress: (opponent: Opponent) => void;
};

export function BattleCard({ opponent, onPress }: Props) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{opponent.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={styles.cardLabel}>レベル：</Text>
          <Text style={styles.cardLevel}>{opponent.level}</Text>
        </View>
      </View>
      <Pressable style={styles.battleBtn} onPress={() => onPress(opponent)}>
        <Text style={styles.battleBtnText}>⚔ バトル</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PLATE,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#000',
    padding: 16,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    elevation: 5,
    marginBottom: 16,
  },
  cardTitle: { color: "#E6EDF7", fontSize: 16, marginBottom: 6 },
  cardLabel: { color: "#AAB7C8", fontSize: 14, marginRight: 6 },
  cardLevel: { color: YELLOW, fontSize: 22, fontWeight: "900" },
  battleBtn: { backgroundColor: RED, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  battleBtnText: { color: "white", fontSize: 14, fontWeight: "800" },
});
