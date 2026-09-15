import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";

export default function DeviceStatus() {
  const items = [
    { icon: "bulb-outline" as const, label: "Light", value: "OFF" },
    { icon: "fan-outline" as const, label: "Fan", value: "OFF" },
    { icon: "desktop-outline" as const, label: "Display", value: "ON" },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Ionicons name={item.icon} size={25} color={COLORS.text} />
          <Text style={styles.label}>{item.label}</Text>
          <Text style={[styles.value, item.value === "ON" && styles.on]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  item: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  value: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  on: {
    color: COLORS.green,
  },
});
