import { View, Text, StyleSheet } from "react-native";

const PLATE = "#2B3545";
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
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
    elevation: 6,
    borderWidth: 5,     
    borderColor: "black",
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
