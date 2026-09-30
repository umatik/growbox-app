import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "@/utils/haptics";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";

const KNOB_SIZE = 52;
const PADDING = 4;
// share of the track the knob has to cover before releasing counts
const CONFIRM_AT = 0.85;
// a light "ratchet" tick every this share of the track while dragging
const TICK_EVERY = 0.1;

interface Props {
  label: string;
  onConfirm: () => void;
  loading?: boolean;
  color?: string;
}

// "slide to unlock": a tap does nothing, only dragging the knob to the end
// confirms, so the action can't fire by accident
export default function SlideToConfirm({
  label,
  onConfirm,
  loading = false,
  color = COLORS.green,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const offset = useRef(new Animated.Value(0)).current;

  const maxOffset = Math.max(0, trackWidth - KNOB_SIZE - 2 * PADDING);

  // the responder is created once, so it reads these through a ref
  const state = useRef({ maxOffset, loading, onConfirm });
  state.current = { maxOffset, loading, onConfirm };
  // haptics: last ratchet step and whether the knob sits past the threshold
  const drag = useRef({ step: 0, armed: false });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !state.current.loading,
        onMoveShouldSetPanResponder: () => !state.current.loading,
        // keep the drag even when the finger strays off the knob
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          drag.current = { step: 0, armed: false };
          Haptics.impact(Haptics.ImpactFeedbackStyle.Light);
        },
        onPanResponderMove: (_, gesture) => {
          const max = state.current.maxOffset;
          const position = Math.min(max, Math.max(0, gesture.dx));
          offset.setValue(position);

          if (max <= 0) return;

          const progress = position / max;
          const armed = progress >= CONFIRM_AT;
          const step = Math.floor(progress / TICK_EVERY);

          // crossing the threshold "clicks" into place, backing off lets go
          if (armed !== drag.current.armed) {
            Haptics.impact(
              armed
                ? Haptics.ImpactFeedbackStyle.Rigid
                : Haptics.ImpactFeedbackStyle.Soft,
            );
          } else if (step !== drag.current.step && !armed) {
            Haptics.selection();
          }

          drag.current = { step, armed };
        },
        onPanResponderRelease: (_, gesture) => {
          const max = state.current.maxOffset;

          if (max > 0 && gesture.dx >= max * CONFIRM_AT) {
            Animated.timing(offset, {
              toValue: max,
              duration: 120,
              useNativeDriver: true,
            }).start();
            Haptics.impact(Haptics.ImpactFeedbackStyle.Heavy);
            state.current.onConfirm();
          } else {
            Haptics.impact(Haptics.ImpactFeedbackStyle.Soft);
            Animated.spring(offset, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(offset, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [offset],
  );

  const labelOpacity = offset.interpolate({
    inputRange: [0, Math.max(1, maxOffset * 0.6)],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const onLayout = (event: LayoutChangeEvent) =>
    setTrackWidth(event.nativeEvent.layout.width);

  return (
    <View style={[styles.track, { borderColor: color }]} onLayout={onLayout}>
      <Animated.View style={[styles.labelBox, { opacity: labelOpacity }]}>
        <Text style={styles.label}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </Animated.View>

      <Animated.View
        style={[
          styles.knob,
          { backgroundColor: color, transform: [{ translateX: offset }] },
        ]}
        {...panResponder.panHandlers}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.surfaceLight} />
        ) : (
          <Ionicons name="water" size={24} color={COLORS.surfaceLight} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: KNOB_SIZE + 2 * PADDING,
    padding: PADDING,
    borderRadius: (KNOB_SIZE + 2 * PADDING) / 2,
    borderWidth: 1,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: "center",
  },

  labelBox: {
    ...StyleSheet.absoluteFill,
    paddingLeft: KNOB_SIZE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  label: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: "600",
  },

  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
