import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { COLORS } from "@/constants/Colors";
import FloweringStart from "@/components/FloweringStart";
import RangeControl from "@/components/controlers/RangeControl";
import SwitchControl from "@/components/controlers/SwitchControl";
import DisplayControl from "@/components/controlers/DisplayControl";

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

      <SwitchControl
        title="Night fan"
        value={nightFanEnabled}
        onChange={setNightFanEnabled}
        icon="moon-outline"
        iconColor={COLORS.blue}
      />

      <RangeControl
        label="Night fan speed"
        value={nightFanSpeed}
        onChange={setNightFanSpeed}
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
