import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const GAUGE_SIZE = 50;
const RADIUS = 22;
const STROKE_WIDTH = 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FAN_SIZE = 24;
const FAN_OFF_COLOR = "#2a4a3e";

const BLADE_PATH = "M24 24 C19 17 18 7 24 4 C31 3 32 14 24 24 Z";

// seconds per turn: 2.4 s near 0 %, 1.08 s at 100 % (the old 60 % speed,
// anything faster looked frantic)
function getRotationSeconds(pct: number) {
  return 2.4 - 1.32 * (pct / 100);
}

// ring filled to the fan level, fan in the middle - spinning with the level,
// or standing still when spin is off
export default function FanGauge({
  pct,
  spin = true,
}: {
  pct: number;
  spin?: boolean;
}) {
  const isOff = pct === 0;
  const fanColor = isOff ? FAN_OFF_COLOR : COLORS.green;

  const progress = useSharedValue(pct / 100);
  const degreesPerMs = useSharedValue(
    isOff || !spin ? 0 : 360 / (getRotationSeconds(pct) * 1000),
  );
  const rotation = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct / 100, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    // only the speed changes - the fan keeps its current angle
    degreesPerMs.value =
      pct === 0 || !spin ? 0 : 360 / (getRotationSeconds(pct) * 1000);
  }, [pct, spin, progress, degreesPerMs]);

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
  );
}

const styles = StyleSheet.create({
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
});
