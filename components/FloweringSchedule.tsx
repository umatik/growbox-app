import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";

interface FloweringScheduleProps {
  totalWeeks?: number;
}

export default function FloweringSchedule({
  totalWeeks = 10,
}: FloweringScheduleProps) {
  const currentWeek = useBoxStore((state) => state.flowering.currentWeek);
  const progress = useBoxStore((state) => state.flowering.progress);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flowering schedule</Text>
        <Text style={styles.week}>
          Week <Text style={styles.weekStrong}>{currentWeek}</Text> of{" "}
          {totalWeeks}
        </Text>
      </View>

      <View style={styles.weeks}>
        {Array.from({ length: totalWeeks }, (_, index) => {
          const week = index + 1;
          const completed = week < currentWeek;
          const current = week === currentWeek;
          const flushWeek = week === 9;
          const harvestWeek = week === 10;

          return (
            <View key={week} style={styles.weekItem}>
              <View
                style={[
                  styles.circle,
                  completed && !flushWeek && !harvestWeek && styles.completed,
                  current && !flushWeek && !harvestWeek && styles.current,
                  flushWeek && styles.flushCircle,
                  harvestWeek && styles.harvestCircle,
                ]}
              >
                <Text
                  style={[
                    styles.number,
                    (completed || current) &&
                      !flushWeek &&
                      !harvestWeek &&
                      styles.numberActive,
                    (flushWeek || harvestWeek) && styles.specialNumber,
                  ]}
                >
                  {completed ? "✓" : week}
                </Text>
              </View>
              <Text
                style={[
                  styles.weekLabel,
                  flushWeek && styles.flushWeekLabel,
                  harvestWeek && styles.harvestWeekLabel,
                ]}
              >
                {week}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Week {currentWeek} progress</Text>
        <Text style={styles.progressPercent}>{progress}%</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
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
  title: { color: COLORS.text, fontSize: 17, fontWeight: "600" },
  week: { color: COLORS.cyan, fontSize: 14, fontWeight: "600" },
  weekStrong: { fontWeight: "700" },
  weeks: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekItem: { alignItems: "center" },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  completed: { backgroundColor: COLORS.greenDark, borderColor: COLORS.green },
  current: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  flushCircle: { backgroundColor: "#91C6CC", borderColor: "#91C6CC" },
  harvestCircle: { backgroundColor: "#B3DFAE", borderColor: "#B3DFAE" },
  number: { color: COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  numberActive: { color: COLORS.background },
  specialNumber: { color: COLORS.background },
  weekLabel: { marginTop: 6, color: COLORS.textMuted, fontSize: 11 },
  flushWeekLabel: { color: "#91C6CC" },
  harvestWeekLabel: { color: "#B3DFAE" },
  progressHeader: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: { color: COLORS.textMuted, fontSize: 13 },
  progressPercent: { color: COLORS.green, fontSize: 13, fontWeight: "700" },
  track: {
    height: 6,
    marginTop: 8,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceLight,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
});
