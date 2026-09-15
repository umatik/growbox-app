import { StyleSheet, Text, View } from "react-native";
import AppShell from "@/components/AppShell";
import { COLORS } from "@/constants/Colors";

export default function SchedulerScreen() {
  return (
    <AppShell title="Scheduler" showModeButton={false}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Light schedule</Text>
          <Text style={styles.value}>ON 18:00</Text>
          <Text style={styles.value}>OFF 06:00</Text>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },
  value: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginTop: 6,
  },
});
