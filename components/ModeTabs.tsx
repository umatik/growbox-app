import { StyleSheet, Pressable, View } from "react-native";
import Text from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";

export type Mode = "MANUAL" | "AUTO";

interface ModeTabsProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange("MANUAL")}
        style={[styles.tab, mode === "MANUAL" && styles.activeTab]}
      >
        <Ionicons
          name="hand-left-outline"
          size={22}
          color={mode === "MANUAL" ? COLORS.green : COLORS.textMuted}
        />
        <Text style={[styles.label, mode === "MANUAL" && styles.activeLabel]}>
          Manual
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange("AUTO")}
        style={[styles.tab, mode === "AUTO" && styles.activeTab]}
      >
        <Ionicons
          name="leaf-outline"
          size={22}
          color={mode === "AUTO" ? COLORS.green : COLORS.textMuted}
        />
        <Text style={[styles.label, mode === "AUTO" && styles.activeLabel]}>
          Auto
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
    flexDirection: "row",
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  tab: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  activeTab: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.green,
  },

  label: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },

  activeLabel: {
    color: COLORS.text,
  },
});
