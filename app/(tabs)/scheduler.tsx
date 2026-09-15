import { StyleSheet, Text, View } from "react-native";
import AppShell from "@/components/AppShell";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";

export default function SchedulerScreen() {
  const mode = useBoxStore((state) => state.mode);
  const on = useBoxStore((state) => state.scheduler.on);
  const off = useBoxStore((state) => state.scheduler.off);
  const setScheduler = useBoxStore((state) => state.setScheduler);

  return (
    <AppShell title="Scheduler" showModeButton={false}>
      <View style={styles.container}>
        {mode !== "AUTO" ? (
          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>i</Text>
            </View>

            <Text style={styles.infoTitle}>Auto mode required</Text>

            <Text style={styles.infoText}>
              The scheduler is available only when the system is running in
              Auto mode.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Light schedule</Text>
                <Text style={styles.subtitle}>
                  Set when the light turns on and off.
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>ON</Text>
                <Text style={styles.time}>{on}</Text>
              </View>

              <View style={styles.timeButton}>
                <Text style={styles.buttonText}>Change</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>OFF</Text>
                <Text style={styles.time}>{off}</Text>
              </View>

              <View style={styles.timeButton}>
                <Text style={styles.buttonText}>Change</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  infoCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  icon: {
    color: COLORS.blue,
    fontSize: 22,
    fontWeight: "700",
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },

  infoText: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  header: {
    marginBottom: 18,
  },

  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
  },

  subtitle: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 13,
  },

  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },

  time: {
    marginTop: 3,
    color: COLORS.green,
    fontSize: 22,
    fontWeight: "700",
  },

  timeButton: {
    minWidth: 76,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
