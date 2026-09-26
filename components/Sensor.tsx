import { StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import { useCompactLayout } from "@/hooks/useCompactLayout";

export default function Sensor() {
  const temperature = useBoxStore((state) => state.sensor.temperature);
  const humidity = useBoxStore((state) => state.sensor.humidity);
  const light = useBoxStore((state) => state.devices.light);
  const compact = useCompactLayout();
  const iconSize = compact ? 30 : 40;

  return (
    <View style={styles.container}>
      <View style={[styles.sensor, compact && styles.sensorCompact]}>
        <Ionicons
          name={light ? "sunny-outline" : "moon-outline"}
          size={iconSize}
          color={light ? COLORS.yellow : COLORS.text}
        />

        <View style={styles.text}>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {temperature == null ? "--" : `${temperature.toFixed(1)}°C`}
          </Text>
          <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
            Temperature
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={[styles.sensor, compact && styles.sensorCompact]}>
        <Ionicons name="water-outline" size={iconSize} color={COLORS.blue} />

        <View style={styles.text}>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {humidity == null ? "--" : `${humidity.toFixed(1)}%`}
          </Text>
          <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
            Humidity
          </Text>
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
  sensorCompact: {
    gap: 8,
  },
  text: {
    flexShrink: 1,
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
