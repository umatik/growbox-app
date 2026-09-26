import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { EnvironmentRow } from "@box-controller/shared/interfaces/esp.interface";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import { useEnvironmentHistory } from "@/hooks/useEnvironmentHistory";

const LABEL_WIDTH = 92;
const PLOT_PADDING_Y = 6;
const NIGHT_FILL = "rgba(255, 255, 255, 0.035)";

type Metric = "temperature" | "humidity";

interface Point {
  time: number;
  row: EnvironmentRow;
}

// "YYYY-MM-DD HH:MM:SS" in ESP local time, parsed by hand so no engine
// guesses the timezone
function parseEspDate(value: string) {
  const [date, time] = value.split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}

function formatTime(time: number) {
  const date = new Date(time);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function formatValue(metric: Metric, value: number) {
  return metric === "temperature"
    ? `${value.toFixed(1)}°C`
    : `${value.toFixed(0)}%`;
}

interface PanelProps {
  metric: Metric;
  label: string;
  color: string;
  points: Point[];
  start: number;
  end: number;
  activeIndex: number | null;
  onScrub: (index: number | null) => void;
}

function Panel({
  metric,
  label,
  color,
  points,
  start,
  end,
  activeIndex,
  onScrub,
}: PanelProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const values = points.map((point) => point.row[metric]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // keep flat data from collapsing into a line glued to the edge
  const span = Math.max(max - min, metric === "temperature" ? 1 : 4);
  const mid = (min + max) / 2;

  const x = (time: number) =>
    ((time - start) / Math.max(end - start, 1)) * size.width;
  const y = (value: number) =>
    PLOT_PADDING_Y +
    (1 - (value - (mid - span / 2)) / span) *
      (size.height - PLOT_PADDING_Y * 2);

  const linePath = useMemo(() => {
    if (!size.width) return "";

    return points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${x(point.time).toFixed(1)} ${y(
            point.row[metric],
          ).toFixed(1)}`,
      )
      .join(" ");
    // x/y only depend on size and the domain derived from points
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, size, metric]);

  // consecutive NIGHT rows become one shaded band
  const nightBands = useMemo(() => {
    const bands: { from: number; to: number }[] = [];

    points.forEach((point, index) => {
      if (point.row.day_night !== "NIGHT") return;

      const next = points[index + 1]?.time ?? point.time;
      const last = bands[bands.length - 1];

      if (last && last.to === point.time) {
        last.to = next;
      } else {
        bands.push({ from: point.time, to: next });
      }
    });

    return bands;
  }, [points]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // don't let the ScrollView steal the scrub
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => scrubAt(event.nativeEvent.locationX),
        onPanResponderMove: (event) => scrubAt(event.nativeEvent.locationX),
        onPanResponderRelease: () => onScrub(null),
        onPanResponderTerminate: () => onScrub(null),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, size.width, start, end],
  );

  function scrubAt(locationX: number) {
    if (!size.width || !points.length) return;

    const time = start + (locationX / size.width) * (end - start);
    let nearest = 0;

    points.forEach((point, index) => {
      if (Math.abs(point.time - time) < Math.abs(points[nearest].time - time)) {
        nearest = index;
      }
    });

    onScrub(nearest);
  }

  const shown = points[activeIndex ?? points.length - 1];

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setSize({ width, height });
  };

  return (
    <View style={styles.panel}>
      <View style={styles.panelLabel}>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.metricValue} numberOfLines={1}>
          {formatValue(metric, shown.row[metric])}
        </Text>
        <Text style={styles.metricRange} numberOfLines={1}>
          {formatValue(metric, min)} – {formatValue(metric, max)}
        </Text>
      </View>

      <View
        style={styles.plot}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {size.width > 0 && (
          <Svg width={size.width} height={size.height} pointerEvents="none">
            {nightBands.map((band) => (
              <Rect
                key={band.from}
                x={x(band.from)}
                y={0}
                width={Math.max(x(band.to) - x(band.from), 1)}
                height={size.height}
                fill={NIGHT_FILL}
              />
            ))}

            <Path
              d={linePath}
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />

            {activeIndex !== null && (
              <>
                <Line
                  x1={x(shown.time)}
                  x2={x(shown.time)}
                  y1={0}
                  y2={size.height}
                  stroke={COLORS.textMuted}
                  strokeWidth={1}
                />
                <Circle
                  cx={x(shown.time)}
                  cy={y(shown.row[metric])}
                  r={4}
                  fill={color}
                  stroke={COLORS.surface}
                  strokeWidth={2}
                />
              </>
            )}
          </Svg>
        )}
      </View>
    </View>
  );
}

export default function EnvironmentChart() {
  const { rows, status } = useEnvironmentHistory();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const points = useMemo(
    () => rows.map((row) => ({ time: parseEspDate(row.datetime), row })),
    [rows],
  );

  if (!points.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        {status === "loading" ? (
          <ActivityIndicator color={COLORS.textMuted} />
        ) : (
          <Text style={styles.emptyText}>
            {status === "offline"
              ? "SD card offline – no history"
              : "History unavailable"}
          </Text>
        )}
      </View>
    );
  }

  const start = points[0].time;
  const end = points[points.length - 1].time;
  const hours = Math.max(1, Math.round((end - start) / 3600000));

  return (
    <View style={styles.container}>
      <Panel
        metric="temperature"
        label="Temperature"
        color={COLORS.green}
        points={points}
        start={start}
        end={end}
        activeIndex={activeIndex}
        onScrub={setActiveIndex}
      />

      <View style={styles.divider} />

      <Panel
        metric="humidity"
        label="Humidity"
        color={COLORS.blue}
        points={points}
        start={start}
        end={end}
        activeIndex={activeIndex}
        onScrub={setActiveIndex}
      />

      <View style={styles.axis}>
        <Text style={styles.axisText}>
          {activeIndex === null
            ? `Last ${hours} h`
            : formatTime(points[activeIndex].time)}
        </Text>
        <Text style={styles.axisText}>
          {formatTime(start)} – {formatTime(end)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // grows into the free space between the sensor card and the controls
  container: {
    flexGrow: 1,
    minHeight: 150,
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  centered: {
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },

  panel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
  },

  panelLabel: {
    width: LABEL_WIDTH,
    justifyContent: "center",
  },

  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },

  metricValue: {
    marginTop: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
  },

  metricRange: {
    marginTop: 1,
    color: COLORS.textMuted,
    fontSize: 11,
  },

  plot: {
    flex: 1,
  },

  divider: {
    height: 1,
    marginVertical: 6,
    backgroundColor: COLORS.border,
  },

  axis: {
    marginTop: 6,
    marginLeft: LABEL_WIDTH,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  axisText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
