import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/Colors";
import { FERTILIZER_SCHEDULE } from "@/data/fertilizerSchedule";
import { useBoxStore } from "@/store";

export default function FertilizerSection() {
  const currentWeek = useBoxStore((state) => state.flowering.currentWeek);
  const fertilizers = FERTILIZER_SCHEDULE[currentWeek] ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrients</Text>
        <Text style={styles.week}>Our Week {currentWeek}</Text>
      </View>

      <View style={styles.list}>
        {fertilizers.map((fertilizer, index) => (
          <View
            key={fertilizer.name}
            style={[
              styles.row,
              index === fertilizers.length - 1 && styles.lastRow,
            ]}
          >
            <Text style={[styles.fertilizerName, { color: fertilizer.color }]}>
              {fertilizer.name}
            </Text>
            <Text style={[styles.dosage, { color: fertilizer.color }]}>
              {fertilizer.dosage == null ? "—" : `${fertilizer.dosage} ml/L`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
  },
  week: { color: COLORS.cyan, fontSize: 14, fontWeight: "600" },
  list: { marginTop: 18 },
  row: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastRow: { borderBottomWidth: 0 },
  fertilizerName: { fontSize: 16, fontWeight: "700" },
  dosage: { fontSize: 18, fontWeight: "600" },
});
