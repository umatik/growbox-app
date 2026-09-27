import { useMemo, useRef, useState } from "react";
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
import { useBoxStore } from "@/store";
import { PhaseTargets, VEG_TARGETS } from "@/data/growTargets";
import {
  parseEspDate,
  useEnvironmentHistory,
} from "@/hooks/useEnvironmentHistory";

// The middle line is 0 = the ideal of the current light phase. Readings are
// drawn as their deviation from it, each metric on its own scale, and the
// blocks mark the optimal range (ideal ± half its width) of each metric.
const TEMPERATURE_RANGE = 5; // plot spans ±5 °C around the ideal
const HUMIDITY_RANGE = 10; // plot spans ±10 % RH around the ideal

const TEMPERATURE_COLOR = COLORS.blue;
const HUMIDITY_COLOR = "#FFB547";
const FEED_COLOR = COLORS.green;
const FEED_BAR_WIDTH = 4;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const HOUR_MS = 60 * 60 * 1000;
// a press shorter and stiller than this is a tap (switches the range),
// anything else is a scrub
const TAP_MAX_MS = 250;
const TAP_MAX_MOVE = 6;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Metric = "temperature" | "humidity";

const RANGES: Record<Metric, number> = {
  temperature: TEMPERATURE_RANGE,
  humidity: HUMIDITY_RANGE,
};

interface Point {
  time: number;
  row: EnvironmentRow;
}

function formatScrubTime(time: number) {
  const date = new Date(time);

  return `${WEEKDAYS[date.getDay()]} ${String(date.getHours()).padStart(
    2,
    "0",
  )}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

// ideal values at a moment, from the light schedule (on/off wrap midnight)
function targetsAt(time: number, on: string, off: string): PhaseTargets {
  const date = new Date(time);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const onMinutes = toMinutes(on);
  const offMinutes = toMinutes(off);
  const lightsOn =
    onMinutes < offMinutes
      ? minutes >= onMinutes && minutes < offMinutes
      : minutes >= onMinutes || minutes < offMinutes;

  return lightsOn ? VEG_TARGETS.lightsOn : VEG_TARGETS.lightsOff;
}

function halfWidth(metric: Metric) {
  const { min, max } = VEG_TARGETS.lightsOn[metric];

  return (max - min) / 2;
}

function LegendItem({
  color,
  label,
  value,
  bar = false,
}: {
  color: string;
  label: string;
  value?: string;
  bar?: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          bar ? styles.legendBar : styles.legendLine,
          { backgroundColor: color },
        ]}
      />
      <Text style={styles.legendLabel}>{label}</Text>
      {value && <Text style={styles.legendValue}>{value}</Text>}
    </View>
  );
}

export default function EnvironmentChart() {
  const { rows, status } = useEnvironmentHistory();
  const feedingHistory = useBoxStore((state) => state.feeding.history);
  const lightsOn = useBoxStore((state) => state.scheduler.on);
  const lightsOff = useBoxStore((state) => state.scheduler.off);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [activeTime, setActiveTime] = useState<number | null>(null);
  const [range, setRange] = useState<"week" | "day">("week");
  const press = useRef({ x: 0, time: 0 });

  const allPoints = useMemo(
    () => rows.map((row) => ({ time: parseEspDate(row.datetime), row })),
    [rows],
  );

  const newest = allPoints[allPoints.length - 1]?.time ?? 0;

  // week: a full week back from the newest reading, so the day grid is
  // complete even while history is short; day: today, midnight to midnight
  const todayStart = new Date(newest).setHours(0, 0, 0, 0);
  const start = range === "week" ? newest - WEEK_MS : todayStart;
  const end = range === "week" ? newest : todayStart + DAY_MS;

  const points = useMemo(
    () => allPoints.filter((point) => point.time >= start && point.time <= end),
    [allPoints, start, end],
  );

  const x = (time: number) =>
    ((time - start) / Math.max(end - start, 1)) * size.width;

  // deviation from the ideal at that moment, 0 in the middle of the plot
  const y = (metric: Metric, value: number, time: number) => {
    const deviation =
      value - targetsAt(time, lightsOn, lightsOff)[metric].ideal;
    const level =
      size.height / 2 - (deviation / RANGES[metric]) * (size.height / 2);

    // keep extreme spikes inside the plot
    return Math.min(Math.max(level, 1), size.height - 1);
  };

  const chart = useMemo(() => {
    if (!size.width) return null;

    const toPath = (metric: Metric) =>
      points
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"}${x(point.time).toFixed(1)} ${y(
              metric,
              point.row[metric],
              point.time,
            ).toFixed(1)}`,
        )
        .join(" ");

    const blockHeight = (metric: Metric) =>
      (halfWidth(metric) / RANGES[metric]) * size.height;

    // grid lines: midnights for the week (label centred in the day column
    // that follows), every 3 h for the day (labels on 06 / 12 / 18)
    const grid: { time: number; label: string | null; labelAt: number }[] = [];

    if (range === "week") {
      const midnight = new Date(start);

      midnight.setHours(24, 0, 0, 0);

      while (midnight.getTime() < end) {
        const time = midnight.getTime();

        grid.push({
          time,
          // skip a label whose column would hang past the right edge
          label: time + DAY_MS / 2 > end ? null : WEEKDAYS[midnight.getDay()],
          labelAt: time + DAY_MS / 2,
        });
        midnight.setDate(midnight.getDate() + 1);
      }
    } else {
      for (let hour = 3; hour < 24; hour += 3) {
        const time = start + hour * HOUR_MS;

        grid.push({
          time,
          label: hour % 6 === 0 ? String(hour).padStart(2, "0") : null,
          labelAt: time,
        });
      }
    }

    const feeds = feedingHistory
      .map((date) => Date.parse(date))
      .filter((time) => time >= start && time <= end);

    return {
      temperaturePath: toPath("temperature"),
      humidityPath: toPath("humidity"),
      temperatureBlock: blockHeight("temperature"),
      humidityBlock: blockHeight("humidity"),
      grid,
      feeds,
    };
    // x/y only depend on size, range and the light schedule
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, size, feedingHistory, range, start, end, lightsOn, lightsOff]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // don't let the ScrollView steal the scrub
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          press.current = { x: event.nativeEvent.locationX, time: Date.now() };
          scrubAt(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => scrubAt(event.nativeEvent.locationX),
        onPanResponderRelease: (event) => {
          const isTap =
            Date.now() - press.current.time < TAP_MAX_MS &&
            Math.abs(event.nativeEvent.locationX - press.current.x) <
              TAP_MAX_MOVE;

          if (isTap) {
            setRange((current) => (current === "week" ? "day" : "week"));
          }

          setActiveTime(null);
        },
        onPanResponderTerminate: () => setActiveTime(null),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, size.width, start, end],
  );

  function scrubAt(locationX: number) {
    if (!size.width || !points.length) return;

    const time = start + (locationX / size.width) * (end - start);
    let nearest = points[0];

    points.forEach((point) => {
      if (Math.abs(point.time - time) < Math.abs(nearest.time - time)) {
        nearest = point;
      }
    });

    setActiveTime(nearest.time);
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setSize({ width, height });
  };

  if (!allPoints.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        {status === "loading" ? (
          <ActivityIndicator color={COLORS.textMuted} />
        ) : (
          <Text style={styles.emptyText}>
            {status === "offline"
              ? "SD card offline – no history"
              : status === "ok"
                ? "No readings yet"
                : "History unavailable"}
          </Text>
        )}
      </View>
    );
  }

  const reading =
    activeTime === null
      ? undefined
      : points.find((point) => point.time === activeTime);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.legend}>
          <LegendItem
            color={TEMPERATURE_COLOR}
            label="Temp"
            value={reading && `${reading.row.temperature.toFixed(1)}°C`}
          />
          <LegendItem
            color={HUMIDITY_COLOR}
            label="Humidity"
            value={reading && `${reading.row.humidity.toFixed(0)}%`}
          />
          <LegendItem color={FEED_COLOR} label="Fed" bar />
        </View>

        <Text style={styles.range}>
          {reading
            ? formatScrubTime(reading.time)
            : range === "week"
              ? "7 days"
              : "Today"}
        </Text>
      </View>

      <View
        style={styles.plot}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {chart && (
          <Svg width={size.width} height={size.height} pointerEvents="none">
            {/* optimal blocks around the 0 line: humidity wider, behind */}
            <Rect
              x={0}
              y={(size.height - chart.humidityBlock) / 2}
              width={size.width}
              height={chart.humidityBlock}
              fill={HUMIDITY_COLOR}
              opacity={0.1}
            />
            <Rect
              x={0}
              y={(size.height - chart.temperatureBlock) / 2}
              width={size.width}
              height={chart.temperatureBlock}
              fill={TEMPERATURE_COLOR}
              opacity={0.16}
            />

            {chart.grid.map((line) => (
              <Line
                key={line.time}
                x1={x(line.time)}
                x2={x(line.time)}
                y1={0}
                y2={size.height}
                stroke={COLORS.border}
                strokeWidth={1}
              />
            ))}

            {/* 0 = ideal */}
            <Line
              x1={0}
              x2={size.width}
              y1={size.height / 2}
              y2={size.height / 2}
              stroke={COLORS.border}
              strokeWidth={1}
            />
            <Line
              x1={0}
              x2={size.width}
              y1={size.height - 0.5}
              y2={size.height - 0.5}
              stroke={COLORS.border}
              strokeWidth={1}
            />

            {chart.feeds.map((time) => (
              <Rect
                key={time}
                x={x(time) - FEED_BAR_WIDTH / 2}
                y={0}
                width={FEED_BAR_WIDTH}
                height={size.height}
                rx={2}
                fill={FEED_COLOR}
                opacity={0.3}
              />
            ))}

            <Path
              d={chart.humidityPath}
              stroke={HUMIDITY_COLOR}
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={chart.temperaturePath}
              stroke={TEMPERATURE_COLOR}
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />

            {reading && (
              <>
                <Line
                  x1={x(reading.time)}
                  x2={x(reading.time)}
                  y1={0}
                  y2={size.height}
                  stroke={COLORS.textMuted}
                  strokeWidth={1}
                />
                <Circle
                  cx={x(reading.time)}
                  cy={y("humidity", reading.row.humidity, reading.time)}
                  r={4}
                  fill={HUMIDITY_COLOR}
                  stroke={COLORS.surface}
                  strokeWidth={2}
                />
                <Circle
                  cx={x(reading.time)}
                  cy={y("temperature", reading.row.temperature, reading.time)}
                  r={4}
                  fill={TEMPERATURE_COLOR}
                  stroke={COLORS.surface}
                  strokeWidth={2}
                />
              </>
            )}
          </Svg>
        )}
      </View>

      <View style={styles.axis}>
        {chart?.grid.map((line) =>
          line.label ? (
            <Text
              key={line.time}
              style={[styles.axisText, { left: x(line.labelAt) - 14 }]}
            >
              {line.label}
            </Text>
          ) : null,
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // grows into the free space between the sensor card and the controls
  container: {
    flexGrow: 1,
    minHeight: 120,
    marginHorizontal: 16,
    marginTop: 14,
    paddingTop: 10,
    paddingBottom: 6,
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },

  legend: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  legendLine: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },

  legendBar: {
    width: 4,
    height: 10,
    borderRadius: 2,
  },

  legendLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },

  legendValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  range: {
    color: COLORS.textMuted,
    fontSize: 12,
  },

  plot: {
    flex: 1,
  },

  axis: {
    height: 16,
    marginTop: 2,
  },

  // fixed width so each weekday label can be centred on its midnight tick
  axisText: {
    position: "absolute",
    width: 28,
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 10,
  },
});
