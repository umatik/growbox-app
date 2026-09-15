import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppShell from "@/components/AppShell";
import AutoMode from "@/components/AutoMode";
import ManualMode from "@/components/ManualMode";
import ModeTabs, { Mode } from "@/components/ModeTabs";

export default function ModeScreen() {
  const [mode, setMode] = useState<Mode>("MANUAL");

  return (
    <AppShell title="Mode" showModeButton={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ModeTabs mode={mode} onChange={setMode} />

        <View style={styles.modeContent}>
          {mode === "MANUAL" ? <ManualMode /> : <AutoMode />}
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },

  modeContent: {
    marginHorizontal: 16,
  },
});
