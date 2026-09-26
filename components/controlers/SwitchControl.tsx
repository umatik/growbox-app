import { StyleSheet, Switch, View } from "react-native";
import Text from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";

interface SwitchControlProps {
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export default function SwitchControl({
  title,
  value,
  onChange,
  icon,
  iconColor = COLORS.blue,
}: SwitchControlProps) {
  return (
    <View style={styles.controlCard}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={25} color={iconColor} />
      </View>

      <View style={styles.controlText}>
        <Text style={styles.controlTitle}>{title}</Text>
        <Text style={styles.status}>{value ? "ON" : "OFF"}</Text>
      </View>

      <View style={styles.switchBox}>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{
            false: COLORS.surfaceLight,
            true: COLORS.greenDark,
          }}
          thumbColor={COLORS.text}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlCard: {
    minHeight: 66,
    paddingLeft: 14,
    paddingRight: 20,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 34,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  controlText: {
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
  },

  controlTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  status: {
    marginTop: 2,
    color: COLORS.green,
    fontSize: 12,
  },

  switchBox: {
    width: 52,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
