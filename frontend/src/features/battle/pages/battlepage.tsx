import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { BattleCard } from "../components/battlecord";
import { StepsPanel } from "../components/stepspanel";
import type { Opponent } from "../types";
import { useNearbyOpponents } from "@/src/hooks/useNearbyOpponents";


const BG = "#1F242B";

export function BattlePage() {
  const yesterdaySteps = 8765;
  const { opponents } = useNearbyOpponents("Player"); 
  const onBattle = (op: Opponent) => {
    console.log("battle with", op);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <StepsPanel steps={yesterdaySteps} />
        <Text style={styles.sectionTitle}>Bluetoothですれ違った相手</Text>
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
