import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import DisplayControl from "@/components/controlers/DisplayControl";
import RangeControl from "@/components/controlers/RangeControl";
import SwitchControl from "@/components/controlers/SwitchControl";
import { useBoxControllerContext } from "@/context/BoxControllerContext";

export default function ManualMode() {
  const { toggleLight, toggleFan, setFanLevel } = useBoxControllerContext();

  const lightEnabled = useBoxStore((state) => state.devices.light);

  const fanEnabled = useBoxStore((state) => state.devices.fan);

  const fanSpeed = useBoxStore((state) => state.devices.fanSpeed);

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Manual mode</Text>
        <Text style={styles.subtitle}>Control everything manually.</Text>
      </View>

      <SwitchControl
        title="Light"
        value={lightEnabled}
        onChange={toggleLight}
        icon="bulb-outline"
        iconColor={COLORS.yellow}
      />

      <SwitchControl
        title="Fan"
        value={fanEnabled}
        onChange={toggleFan}
        icon="aperture-outline"
        iconColor={COLORS.blue}
      />

      <RangeControl label="Fan speed" value={fanSpeed} onChange={setFanLevel} />

      <DisplayControl />
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
});
