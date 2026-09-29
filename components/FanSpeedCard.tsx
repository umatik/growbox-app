import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G, Path } from "react-native-svg";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import { useCompactLayout } from "@/hooks/useCompactLayout";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GAUGE_SIZE = 50;
const RADIUS = 22;
const STROKE_WIDTH = 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FAN_SIZE = 24;
const FAN_OFF_COLOR = "#2a4a3e";
const PILL_BACKGROUND = "rgba(0, 233, 90, 0.12)";

const SEGMENTS = [0, 1, 2, 3, 4];

const BLADE_PATH = "M24 24 C19 17 18 7 24 4 C31 3 32 14 24 24 Z";

function getLevelLabel(pct: number) {
  if (pct === 0) return "OFF";
  if (pct < 35) return "LOW";
  if (pct < 70) return "MEDIUM";
  if (pct < 90) return "HIGH";
  return "MAX";
}

// seconds per turn: 2.4 s near 0 %, 1.08 s at 100 % (the old 60 % speed,
// anything faster looked frantic)
function getRotationSeconds(pct: number) {
  return 2.4 - 1.32 * (pct / 100);
}

export default function FanSpeedCard() {
  const fanLevel = useBoxStore((state) => state.devices.fanLevel);
  const compact = useCompactLayout();

  const pct = Math.round(Math.min(100, Math.max(0, fanLevel)));
  const isOff = pct === 0;
  const fanColor = isOff ? FAN_OFF_COLOR : COLORS.green;

  const progress = useSharedValue(pct / 100);
  const degreesPerMs = useSharedValue(
    isOff ? 0 : 360 / (getRotationSeconds(pct) * 1000),
  );
  const rotation = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct / 100, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    // only the speed changes - the fan keeps its current angle
    degreesPerMs.value = pct === 0 ? 0 : 360 / (getRotationSeconds(pct) * 1000);
  }, [pct, progress, degreesPerMs]);

  useFrameCallback((frame) => {
    const delta = frame.timeSincePreviousFrame ?? 0;

    rotation.value = (rotation.value + delta * degreesPerMs.value) % 360;
  });

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const fanStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.gauge}>
        <Svg
          width={GAUGE_SIZE}
          height={GAUGE_SIZE}
          viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
        >
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke={COLORS.border}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          <G rotation={-90} origin={`${GAUGE_SIZE / 2}, ${GAUGE_SIZE / 2}`}>
            <AnimatedCircle
              cx={GAUGE_SIZE / 2}
              cy={GAUGE_SIZE / 2}
              r={RADIUS}
              stroke={COLORS.green}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              fill="none"
              animatedProps={arcProps}
            />
          </G>
        </Svg>

        <Animated.View style={[styles.fan, fanStyle]}>
          <Svg width={FAN_SIZE} height={FAN_SIZE} viewBox="0 0 48 48">
            {[0, 120, 240].map((angle) => (
              <Path
                key={angle}
                d={BLADE_PATH}
                fill={fanColor}
                rotation={angle}
                origin="24, 24"
              />
            ))}

            <Circle cx={24} cy={24} r={5} fill={fanColor} />
            <Circle cx={24} cy={24} r={2} fill={COLORS.surface} />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.label} numberOfLines={1}>
            Fan speed
          </Text>

          <View style={styles.pill}>
            <Text style={[styles.pillText, isOff && styles.pillTextOff]}>
              {getLevelLabel(pct)}
            </Text>
          </View>
        </View>

        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {pct}
          <Text style={styles.unit}>%</Text>
        </Text>

        <View style={styles.segments}>
          {SEGMENTS.map((index) => (
            <View
              key={index}
              style={[styles.segment, pct > index * 20 && styles.segmentActive]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  containerCompact: {
    paddingHorizontal: 14,
    gap: 12,
  },
  gauge: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  fan: {
    position: "absolute",
    width: FAN_SIZE,
    height: FAN_SIZE,
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
