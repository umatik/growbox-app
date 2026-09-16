import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { COLORS } from "@/constants/Colors";

interface RangeControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export default function RangeControl({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
}: RangeControlProps) {
  const [width, setWidth] = useState(0);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const percentage = ((localValue - min) / (max - min)) * 100;

  const updateFromX = (x: number) => {
    if (!width) return;

    const clampedX = Math.max(0, Math.min(width, x));

    const rawValue = min + (clampedX / width) * (max - min);

    const steppedValue = Math.round((rawValue - min) / step) * step + min;

    const nextValue = Math.max(min, Math.min(max, steppedValue));

    setLocalValue(nextValue);
    onChange(nextValue);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (event) => {
          updateFromX(event.nativeEvent.locationX);
        },

        onPanResponderMove: (event) => {
          updateFromX(event.nativeEvent.locationX);
        },
      }),
    [width, min, max, step],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>

        <Text style={styles.value}>
          {localValue}
          {unit}
        </Text>
      </View>

      <View
        style={styles.trackTouch}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
              },
            ]}
          />
        </View>

        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              left: `${percentage}%`,
            },
          ]}
        />
      </View>

      <View style={styles.scale}>
        <Text style={styles.scaleText}>
          {min}
          {unit}
        </Text>

        <Text style={styles.scaleText}>
          {max}
          {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  label: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  value: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  trackTouch: {
    height: 24,
    justifyContent: "center",
  },

  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceLight,
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.blue,
  },

  thumb: {
    position: "absolute",
    top: 4,
    width: 16,
    height: 16,
    marginLeft: -8,
    borderRadius: 8,
    backgroundColor: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },

  scale: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  scaleText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
