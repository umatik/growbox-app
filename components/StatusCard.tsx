import { StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";

export default function StatusCard() {
  return (
    <View style={styles.container}>
      <Ionicons name="leaf" size={58} color={COLORS.green} />
      <View style={styles.status}>
        <View style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.title}>All systems normal</Text>
        </View>
        <Text style={styles.subtitle}>Your plants are doing great!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  status: {
    alignItems: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 5,
  },
});
