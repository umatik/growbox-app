import { StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";
import { FERTILIZER_SCHEDULE } from "@/data/fertilizerSchedule";
import { useFloweringProgress } from "@/hooks/useFloweringProgress";

export default function FertilizerSection() {
  const { currentWeek } = useFloweringProgress();
  const fertilizers = FERTILIZER_SCHEDULE[currentWeek] ?? [];
  const waterOnly = currentWeek > 8;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrients schedule</Text>
        <Text style={styles.week}>Week {currentWeek}</Text>
      </View>

      {waterOnly ? (
        <View style={styles.waterOnly}>
          <Ionicons name="water-outline" size={42} color="#FFFFFF" />

          <Text style={styles.waterOnlyTitle}>Water only</Text>

          <Text style={styles.waterOnlyText}>
            No nutrients are needed after week 8.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {fertilizers.map((fertilizer, index) => (
            <View
              key={fertilizer.name}
              style={[
                styles.row,
                index === fertilizers.length - 1 && styles.lastRow,
              ]}
            >
              <Text
                style={[styles.fertilizerName, { color: fertilizer.color }]}
              >
                {fertilizer.name}
              </Text>

              <Text style={[styles.dosage, { color: fertilizer.color }]}>
                {fertilizer.dosage == null ? "—" : `${fertilizer.dosage} ml`}
              </Text>
            </View>
          ))}
        </View>
      )}
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },

  title: {
    flexShrink: 1,
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
  },

  week: {
    color: COLORS.cyan,
    fontSize: 14,
    fontWeight: "600",
  },

  list: {
    marginTop: 8,
  },

  waterOnly: {
    marginTop: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  waterOnlyTitle: {
    color: COLORS.cyan,
    fontSize: 18,
    fontWeight: "700",
    paddingTop: 16,
  },

  waterOnlyText: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 14,
    textAlign: "center",
  },

  row: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  fertilizerName: {
    flexShrink: 1,
    marginRight: 12,
    fontSize: 15,
    fontWeight: "700",
  },

  dosage: {
    fontSize: 16,
    fontWeight: "600",
  },
});
