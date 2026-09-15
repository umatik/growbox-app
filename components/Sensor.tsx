import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";

interface SensorProps {
  temperature?: number | null;
  humidity?: number | null;
}

export default function Sensor({
  temperature = 17.1,
  humidity = 61.5,
}: SensorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sensor}>
        <Ionicons name="sunny-outline" size={42} color={COLORS.yellow} />
        <View>
          <Text style={styles.value}>
            {temperature == null ? "--" : `${temperature.toFixed(1)}°C`}
          </Text>
          <Text style={styles.label}>Temperature</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.sensor}>
        <Ionicons name="water-outline" size={42} color={COLORS.blue} />
        <View>
          <Text style={styles.value}>
            {humidity == null ? "--" : `${humidity.toFixed(1)}%`}
          </Text>
          <Text style={styles.label}>Humidity</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  sensor: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    width: 1,
    height: 44,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  value: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "600",
  },
  label: {
    color: COLORS.cyan,
    fontSize: 12,
    marginTop: 2,
  },
});
