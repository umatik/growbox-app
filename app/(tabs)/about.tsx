import { StyleSheet, Text, View } from "react-native";
import AppShell from "@/components/AppShell";
import { COLORS } from "@/constants/Colors";

export default function AboutScreen() {
  return (
    <AppShell title="About" showModeButton={false}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Box Panel</Text>
          <Text style={styles.subtitle}>Grow Controller</Text>
        </View>

        <Text style={styles.section}>Device information</Text>

        <View style={styles.card}>
          <Text style={styles.row}>Firmware version        1.0.0</Text>
          <Text style={styles.row}>Connection status       Connected</Text>
          <Text style={styles.row}>Uptime                  3 days, 4 hours</Text>
        </View>

        <Text style={styles.section}>App information</Text>

        <View style={styles.card}>
          <Text style={styles.row}>App version             1.0.0</Text>
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
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
  },
  row: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginVertical: 5,
  },
});
