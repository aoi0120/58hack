import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BattleCard } from "../components/battlecord";
import { StepsPanel } from "../components/stepspanel";
import type { Opponent } from "../types";
import { useNearbyOpponents } from "@/src/hooks/useNearbyOpponents";

const BG = "#1F242B";

export function BattlePage() {
  const yesterdaySteps = 8765;
  const { opponents, scanning } = useNearbyOpponents("Player"); 
  const onBattle = (op: Opponent) => console.log("battle with", op);

  const Empty = () => (
    <View style={styles.emptyWrap}>
      {scanning ? (
        <>
          <ActivityIndicator />
          <Text style={styles.emptyText}>近くの相手を探しています…</Text>
        </>
      ) : (
        <Text style={styles.emptyText}>バトルできる人がいません</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <StepsPanel steps={yesterdaySteps} />
        <Text style={styles.sectionTitle}>Bluetoothですれ違った相手</Text>

        {opponents.length === 0 ? (
          <Empty />
        ) : (
          opponents.map((op) => (
            <BattleCard key={op.id} opponent={op} onPress={onBattle} />
          ))
        )}

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
  emptyWrap: {
    padding: 20,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#000",
    backgroundColor: "#2B3545",
    alignItems: "center",
    gap: 8,
  },
  emptyText: { color: "#AAB7C8", fontSize: 16 },
});
