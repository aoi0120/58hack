import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { BattleCard } from "../components/battlecord";
import { StepsPanel } from "../components/stepspanel";
import type { Opponent } from "../types";

const BG = "#1F242B";

const opponents: Opponent[] = [
  { id: "a", name: "謎のサラリーマン", level: 12 },
  { id: "b", name: "散歩中の犬", level: 5 },
  { id: "c", name: "ジム帰りの学生", level: 25 },
];

export function BattlePage() {
  const yesterdaySteps = 8765;

  const onBattle = (op: Opponent) => {
    console.log("battle with", op);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <StepsPanel steps={yesterdaySteps} />

        <Text style={styles.sectionTitle}>すれ違った相手</Text>

        {opponents.map((op) => (
          <BattleCard key={op.id} opponent={op} onPress={onBattle} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16 },
  sectionTitle: {
    color: "#E6EDF7",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 8,
  },
});
