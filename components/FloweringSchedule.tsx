import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/Colors";

interface FloweringScheduleProps {
  currentWeek: number;
  totalWeeks?: number;
  progress?: number;
}

export default function FloweringSchedule({
  currentWeek,
  totalWeeks = 10,
  progress = 30,
}: FloweringScheduleProps) {
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

          // Our Week 9 = BioBizz WK11
          const flushWeek = week === 9;

          // Our Week 10 = BioBizz WK12
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
        <View
          style={[
            styles.progress,
            {
              width: `${progress}%`,
            },
          ]}
        />
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
    fontSize: 16,
    fontWeight: "600",
  },

  week: {
    color: COLORS.cyan,
    fontSize: 14,
  },

  weekStrong: {
    fontWeight: "700",
  },

  weeks: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  weekItem: {
    alignItems: "center",
    gap: 5,
  },

  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  completed: {
    backgroundColor: COLORS.greenDark,
  },

  current: {
    backgroundColor: COLORS.green,
  },

  flushCircle: {
    backgroundColor: "#91C6CC",
  },

  harvestCircle: {
    backgroundColor: "#B3DFAE",
  },

  number: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  numberActive: {
    color: "#001515",
  },

  specialNumber: {
    color: COLORS.text,
  },

  weekLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },

  flushWeekLabel: {
    color: "#91C6CC",
  },

  harvestWeekLabel: {
    color: "#B3DFAE",
  },

  progressHeader: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressLabel: {
    color: COLORS.text,
    fontSize: 14,
  },

  progressPercent: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  track: {
    height: 10,
    marginTop: 8,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceLight,
  },

  progress: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },
});
