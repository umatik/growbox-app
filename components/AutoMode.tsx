import { StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { COLORS } from "@/constants/Colors";
import RangeControl from "@/components/RangeControl";

export default function AutoMode() {
  const [nightFanEnabled, setNightFanEnabled] = useState(true);
  const [fanSpeed, setFanSpeed] = useState(50);
  const [nightFanSpeed, setNightFanSpeed] = useState(30);

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Auto mode</Text>
        <Text style={styles.subtitle}>
          Automated growing schedule.
        </Text>
      </View>

      <View style={styles.controlCard}>
        <View style={styles.iconBox}>
          <Ionicons name="leaf-outline" size={25} color={COLORS.green} />
        </View>

        <View style={styles.controlText}>
          <Text style={styles.controlTitle}>Flowering start</Text>
          <Text style={styles.status}>2026-09-06, Week 1</Text>
        </View>

        <Ionicons
          name="close-circle"
          size={30}
          color={COLORS.red}
        />
      </View>

      <RangeControl
        label="Fan speed"
        value={fanSpeed}
        onChange={setFanSpeed}
      />

      <View style={styles.controlCard}>
        <View style={styles.iconBox}>
          <Ionicons
            name="moon-outline"
            size={25}
            color={COLORS.blue}
          />
        </View>

        <View style={styles.controlText}>
          <Text style={styles.controlTitle}>Night fan</Text>
          <Text style={styles.status}>
            {nightFanEnabled ? "ON" : "OFF"}
          </Text>
        </View>

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

      <RangeControl
        label="Night fan speed"
        value={nightFanSpeed}
        onChange={setNightFanSpeed}
      />

      <View style={styles.controlCard}>
        <View style={styles.iconBox}>
          <Ionicons
            name="time-outline"
            size={25}
            color={COLORS.text}
          />
        </View>

        <View style={styles.controlText}>
          <Text style={styles.controlTitle}>Scheduler</Text>
          <Text style={styles.status}>
            ON: 18:00   OFF: 06:00
          </Text>
        </View>

        <Ionicons
          name="chevron-forward-outline"
          size={22}
          color={COLORS.textMuted}
        />
      </View>

      <View style={styles.saveButton}>
        <Text style={styles.saveText}>Save</Text>
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
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 34,
    alignItems: "center",
  },

  controlText: {
    flex: 1,
    marginLeft: 8,
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

  saveButton: {
    height: 50,
    marginTop: 4,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  saveText: {
    color: "#001515",
    fontSize: 15,
    fontWeight: "700",
  },
});
