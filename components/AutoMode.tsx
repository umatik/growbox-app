import { StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { COLORS } from "@/constants/Colors";
import RangeControl from "@/components/RangeControl";
import FloweringStart from "@/components/FloweringStart";

export default function AutoMode() {
  const [nightFanEnabled, setNightFanEnabled] = useState(true);
  const [fanSpeed, setFanSpeed] = useState(50);
  const [nightFanSpeed, setNightFanSpeed] = useState(30);

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Auto mode</Text>
        <Text style={styles.subtitle}>Automated growing schedule.</Text>
      </View>

      <FloweringStart />

      <RangeControl label="Fan speed" value={fanSpeed} onChange={setFanSpeed} />

      <View style={styles.controlCard}>
        <View style={styles.iconBox}>
          <Ionicons name="moon-outline" size={25} color={COLORS.blue} />
        </View>

        <View style={styles.controlText}>
          <Text style={styles.controlTitle}>Night fan</Text>
          <Text style={styles.status}>{nightFanEnabled ? "ON" : "OFF"}</Text>
        </View>

        <View style={styles.switchBox}>
          <Switch
            value={nightFanEnabled}
            onValueChange={setNightFanEnabled}
            trackColor={{
              false: COLORS.surfaceLight,
              true: COLORS.greenDark,
            }}
            thumbColor={COLORS.text}
          />
        </View>
      </View>

      <RangeControl
        label="Night fan speed"
        value={nightFanSpeed}
        onChange={setNightFanSpeed}
      />

      <View style={styles.controlCard}>
        <View style={styles.iconBox}>
          <Ionicons name="time-outline" size={25} color={COLORS.text} />
        </View>

        <View style={styles.controlText}>
          <Text style={styles.controlTitle}>Scheduler</Text>
          <Text style={styles.status}>ON: 18:00 OFF: 06:00</Text>
        </View>

        <View style={styles.switchBox}>
          <Ionicons
            name="chevron-forward-outline"
            size={22}
            color={COLORS.textMuted}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    gap: 10,
  },

  heading: {
    marginBottom: 2,
  },

  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 14,
  },

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
