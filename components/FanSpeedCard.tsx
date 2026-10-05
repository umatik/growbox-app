import { StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import { useCompactLayout } from "@/hooks/useCompactLayout";
import FanGauge from "@/components/FanGauge";
import HumidifierStatus from "@/components/HumidifierStatus";

const PILL_BACKGROUND = "rgba(0, 233, 90, 0.12)";

const SEGMENTS = [0, 1, 2, 3, 4];

function getLevelLabel(pct: number) {
  if (pct === 0) return "OFF";
  if (pct < 35) return "LOW";
  if (pct < 70) return "MEDIUM";
  if (pct < 90) return "HIGH";
  return "MAX";
}

export default function FanSpeedCard() {
  const fanLevel = useBoxStore((state) => state.devices.fanLevel);
  const fanOn = useBoxStore((state) => state.devices.fan);
  const humidifier = useBoxStore((state) => state.humidifier);
  const compact = useCompactLayout();
  // with a humidifier the card splits into two halves - no room for the pill
  const split = humidifier !== null;

  // the dimmer keeps its level while the fan relay is off - that is 0 %
  const pct = fanOn ? Math.round(Math.min(100, Math.max(0, fanLevel))) : 0;
  const isOff = pct === 0;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.fanHalf}>
        <FanGauge pct={pct} />

        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.label} numberOfLines={1}>
              {split ? "Fan" : "Fan speed"}
            </Text>

            {!split && (
              <View style={styles.pill}>
                <Text style={[styles.pillText, isOff && styles.pillTextOff]}>
                  {getLevelLabel(pct)}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {pct}
            <Text style={styles.unit}>%</Text>
          </Text>

          <View style={styles.segments}>
            {SEGMENTS.map((index) => (
              <View
                key={index}
                style={[
                  styles.segment,
                  pct > index * 20 && styles.segmentActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {humidifier && (
        <>
          <View style={styles.divider} />
          <HumidifierStatus humidifier={humidifier} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  containerCompact: {
    paddingHorizontal: 16,
    gap: 12,
  },
  fanHalf: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: COLORS.border,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  label: {
    flexShrink: 1,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  pill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: PILL_BACKGROUND,
  },
  pillText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  pillTextOff: {
    color: COLORS.textMuted,
  },
  value: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "600",
  },
  unit: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  segments: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  segmentActive: {
    backgroundColor: COLORS.green,
  },
});
