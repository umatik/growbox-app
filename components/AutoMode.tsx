import { StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import FloweringStart from "@/components/FloweringStart";
import RangeControl from "@/components/controlers/RangeControl";
import SwitchControl from "@/components/controlers/SwitchControl";
import DisplayControl from "@/components/controlers/DisplayControl";
import { useBoxControllerContext } from "@/context/BoxControllerContext";
import { useBoxStore } from "@/store";

export default function AutoMode() {
  const nightFanEnabled = useBoxStore((state) => state.auto.nightFanEnabled);

  const fanSpeed = useBoxStore((state) => state.devices.fanSpeed);

  const nightLevel = useBoxStore((state) => state.devices.nightLevel);

  const { toggleNightFan, setFanLevel, setNightFanLevel } =
    useBoxControllerContext();

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Auto mode</Text>
        <Text style={styles.subtitle}>Automated growing schedule.</Text>
      </View>

      <FloweringStart />

      <RangeControl label="Fan speed" value={fanSpeed} onChange={setFanLevel} />

      <SwitchControl
        title="Night fan"
        value={nightFanEnabled}
        onChange={() => toggleNightFan()}
        icon="moon-outline"
        iconColor={COLORS.blue}
      />

      <RangeControl
        label="Night dimmer level"
        value={nightLevel}
        onChange={setNightFanLevel}
      />

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
