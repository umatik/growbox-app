import { StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";
import RangeControl from "@/components/RangeControl";
import { useBoxStore } from "@/store";

export default function ManualMode() {
  const lightEnabled = useBoxStore((state) => state.devices.light);
  const fanEnabled = useBoxStore((state) => state.devices.fan);
  const displayEnabled = useBoxStore((state) => state.devices.display);
  const fanSpeed = useBoxStore((state) => state.devices.fanSpeed);

  const setLight = useBoxStore((state) => state.setLight);
  const setFan = useBoxStore((state) => state.setFan);
  const setDisplay = useBoxStore((state) => state.setDisplay);
  const setFanSpeed = useBoxStore((state) => state.setFanSpeed);

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Manual mode</Text>
        <Text style={styles.subtitle}>Control everything manually.</Text>
      </View>

      <View style={styles.controlCard}>
        <View style={styles.iconBox}>
          <Ionicons name="bulb-outline" size={25} color={COLORS.yellow} />
        </View>
        <View style={styles.controlText}>
          <Text style={styles.controlTitle}>Light</Text>
          <Text style={styles.status}>{lightEnabled ? "ON" : "OFF"}</Text>
        </View>
        <View style={styles.switchBox}>
          <Switch
            value={lightEnabled}
            onValueChange={setLight}
            trackColor={{ false: COLORS.surfaceLight, true: COLORS.greenDark }}
            thumbColor={COLORS.text}
          />
        </View>
      </View>

      <View style={styles.controlCard}>
        <View style={styles.iconBox}>
          <Ionicons name="aperture-outline" size={25} color={COLORS.blue} />
        </View>
        <View style={styles.controlText}>
          <Text style={styles.controlTitle}>Fan</Text>
          <Text style={styles.status}>{fanEnabled ? "ON" : "OFF"}</Text>
        </View>
        <View style={styles.switchBox}>
          <Switch
            value={fanEnabled}
            onValueChange={setFan}
            trackColor={{ false: COLORS.surfaceLight, true: COLORS.greenDark }}
            thumbColor={COLORS.text}
          />
        </View>
      </View>

      <RangeControl
        label="Fan speed"
        value={fanSpeed}
        onChange={setFanSpeed}
      />

      <View style={styles.controlCard}>
        <View style={styles.iconBox}>
          <Ionicons name="desktop-outline" size={25} color={COLORS.blue} />
        </View>
        <View style={styles.controlText}>
          <Text style={styles.controlTitle}>Display</Text>
          <Text style={styles.status}>{displayEnabled ? "ON" : "OFF"}</Text>
        </View>
        <View style={styles.switchBox}>
          <Switch
            value={displayEnabled}
            onValueChange={setDisplay}
            trackColor={{ false: COLORS.surfaceLight, true: COLORS.greenDark }}
            thumbColor={COLORS.text}
          />
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons
          name="information-circle-outline"
          size={25}
          color={COLORS.blue}
        />
        <Text style={styles.infoText}>
          Manual mode gives you full control over all devices.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 18, gap: 10 },
  heading: { marginBottom: 2 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  subtitle: { marginTop: 3, color: COLORS.textMuted, fontSize: 14 },
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
  controlTitle: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
  status: { marginTop: 2, color: COLORS.green, fontSize: 12 },
  switchBox: {
    width: 52,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    minHeight: 66,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
