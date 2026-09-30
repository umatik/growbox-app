import { StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import { useBoxControllerContext } from "@/context/BoxControllerContext";

const BAR_HEIGHTS = [4, 7, 10, 13];

// same thresholds as the bars on the controller's LCD
function barsFor(rssi: number) {
  if (rssi >= -60) return 4;
  if (rssi >= -70) return 3;
  if (rssi >= -80) return 2;
  return 1;
}

// the ESP32 holds a stable link down to about -80 dBm
function colorFor(rssi: number) {
  if (rssi >= -67) return COLORS.green;
  if (rssi >= -80) return COLORS.yellow;
  return COLORS.red;
}

// WiFi signal of the controller: bars plus dBm, grey when it can't be reached
export default function SignalStatus() {
  const rssi = useBoxStore((state) => state.rssi);
  const { error } = useBoxControllerContext();

  const offline = Boolean(error);
  const known = !offline && rssi != null;
  // at least one bar always lit: grey = no reading yet, red = unreachable
  const bars = known ? barsFor(rssi) : 1;
  const color = known
    ? colorFor(rssi)
    : offline
      ? COLORS.red
      : COLORS.textMuted;

  return (
    <View
      style={styles.container}
      accessibilityLabel={
        offline
          ? "Controller offline"
          : known
            ? `Controller WiFi signal ${rssi} dBm`
            : "Controller WiFi signal unknown"
      }
    >
      <View style={styles.bars}>
        {BAR_HEIGHTS.map((height, index) => (
          <View
            key={height}
            style={[
              styles.bar,
              {
                height,
                backgroundColor: index < bars ? color : COLORS.border,
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.value, { color }]}>
        {offline ? "offline" : known ? `${rssi} dBm` : "--"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 12,
  },

  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 13,
  },

  bar: {
    width: 3,
    borderRadius: 1,
  },

  value: {
    fontSize: 10,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
