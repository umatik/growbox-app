import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";

interface ModeSelectorProps {
  mode: "AUTO" | "MANUAL";
  onChange?: (mode: "AUTO" | "MANUAL") => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, mode === "AUTO" && styles.active]}
        onPress={() => onChange?.("AUTO")}
        activeOpacity={0.8}
      >
        <Ionicons
          name="leaf-outline"
          size={22}
          color={mode === "AUTO" ? COLORS.green : COLORS.textMuted}
        />
        <Text style={[styles.text, mode === "AUTO" && styles.activeText]}>
          Auto
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, mode === "MANUAL" && styles.active]}
        onPress={() => onChange?.("MANUAL")}
        activeOpacity={0.8}
      >
        <Ionicons
          name="hand-left-outline"
          size={22}
          color={mode === "MANUAL" ? COLORS.green : COLORS.textMuted}
        />
        <Text style={[styles.text, mode === "MANUAL" && styles.activeText]}>
          Manual
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
  },
  option: {
    flex: 1,
    height: 46,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  active: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
  activeText: {
    color: COLORS.text,
  },
});
