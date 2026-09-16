import { StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import DisplayControl from "@/components/controlers/DisplayControl";
import RangeControl from "@/components/controlers/RangeControl";
import SwitchControl from "@/components/controlers/SwitchControl";

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

      <SwitchControl
        title="Light"
        value={lightEnabled}
        onChange={setLight}
        icon="bulb-outline"
        iconColor={COLORS.yellow}
      />

      <SwitchControl
        title="Fan"
        value={fanEnabled}
        onChange={setFan}
        icon="aperture-outline"
        iconColor={COLORS.blue}
      />

      <RangeControl label="Fan speed" value={fanSpeed} onChange={setFanSpeed} />

      <DisplayControl />
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
