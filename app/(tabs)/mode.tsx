import { StyleSheet, View } from "react-native";
import AppShell from "@/components/AppShell";
import ModeTabs from "@/components/ModeTabs";
import ManualMode from "@/components/ManualMode";
import AutoMode from "@/components/AutoMode";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";

export default function ModeScreen() {
  const mode = useBoxStore((state) => state.mode);
  const setMode = useBoxStore((state) => state.setMode);

  return (
    <AppShell title="Mode" showModeButton={false}>
      <View style={styles.container}>
        <ModeTabs mode={mode} onChange={setMode} />
        {mode === "MANUAL" ? <ManualMode /> : <AutoMode />}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
  },
});
