import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";

const RETRY_S = 20;
const SIZE = 34;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  onRetry: () => void;
  // a reconnect is running (manual or automatic) - the countdown waits
  busy: boolean;
}

// Countdown ring under the RELOAD button: every 20 s it tries to reconnect
// on its own, and starts over while the controller stays unreachable.
export default function AutoRetry({ onRetry, busy }: Props) {
  const [left, setLeft] = useState(RETRY_S);
  const [cycle, setCycle] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const retry = useRef(onRetry);
  retry.current = onRetry;

  useEffect(() => {
    if (busy) return;

    const started = Date.now();
    setLeft(RETRY_S);
    progress.setValue(0);

    const countdown = Animated.timing(progress, {
      toValue: 1,
      duration: RETRY_S * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    countdown.start(({ finished }) => {
      if (!finished) return;

      retry.current();
      // starts over even if the retry never flips busy
      setCycle((c) => c + 1);
    });

    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      setLeft(Math.max(1, RETRY_S - elapsed));
    }, 250);

    return () => {
      countdown.stop();
      clearInterval(tick);
    };
  }, [busy, cycle, progress]);

  useEffect(() => {
    if (!busy) return;

    spin.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();

    return () => loop.stop();
  }, [busy, spin]);

  // the ring empties as the retry comes closer
  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, CIRCUMFERENCE],
  });
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.ring}>
        {busy ? (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="sync" size={20} color={COLORS.cyan} />
          </Animated.View>
        ) : (
          <>
            <Svg width={SIZE} height={SIZE} style={styles.svg}>
              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={COLORS.border}
                strokeWidth={STROKE}
                fill="none"
              />
              <AnimatedCircle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={COLORS.cyan}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                fill="none"
              />
            </Svg>
            <Text style={styles.seconds}>{left}</Text>
          </>
        )}
      </View>

      <Text style={styles.label}>
        {busy ? "Reconnecting…" : `Auto retry in ${left} s`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  ring: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },

  // starts at 12 o'clock
  svg: {
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
  },

  seconds: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },

  label: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
});
