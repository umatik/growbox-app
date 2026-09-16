import { ScrollView, StyleSheet, Text, View } from "react-native";
import AppShell from "@/components/AppShell";
import { COLORS } from "@/constants/Colors";
import ModeTabs from "@/components/ModeTabs";
import ManualMode from "@/components/ManualMode";
import AutoMode from "@/components/AutoMode";
import { useBoxStore } from "@/store";
import { useBoxControllerContext } from "@/context/BoxControllerContext";

export default function AboutScreen() {
  const mode = useBoxStore((state) => state.mode);
  const { toggleMode } = useBoxControllerContext();

  return (
    <AppShell title="Settings" showModeButton={false}>
      <View style={styles.container}>
        <ModeTabs mode={mode} onChange={toggleMode} />
        {mode === "MANUAL" ? <ManualMode /> : <AutoMode />}
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
