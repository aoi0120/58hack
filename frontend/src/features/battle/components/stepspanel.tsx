import { View, Text, StyleSheet } from "react-native";

const PLATE = "#2B3545";
const SHADOW = "#11161d";
const YELLOW = "#F8D94E";

type Props = {
  steps: number;
};

export function StepsPanel({ steps }: Props) {
  return (
    <View style={styles.panel}>
      <Text style={styles.caption}>自分の昨日の歩数</Text>
      <View style={styles.stepsRow}>
        <Text style={styles.stepsValue}>{steps.toLocaleString()}</Text>
        <Text style={styles.stepsUnit}>歩</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: PLATE,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: SHADOW,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  caption: {
    color: "#C9D1E0",
    textAlign: "center",
    marginBottom: 8,
    fontSize: 14,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
  },
  stepsValue: {
    color: YELLOW,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  stepsUnit: {
    color: "#C9D1E0",
    marginLeft: 8,
    fontSize: 16,
  },
});
