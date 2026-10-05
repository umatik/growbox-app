import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { EnvironmentRow } from "@/shared/interfaces/esp.interface";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import { FLOWER_TARGETS, PhaseTargets, VEG_TARGETS } from "@/data/growTargets";
import {
  parseEspDate,
  thin,
  useEnvironmentHistory,
} from "@/hooks/useEnvironmentHistory";

// Readings are drawn as plain values, each metric on its own scale (like the
// desktop chart). The blocks behind them are the optimal range of each metric
// for the light at that time - MANUAL (veg) keeps it on nonstop, AUTO
// (flowering) follows the light schedule with its own ranges. In AUTO the
// readings before the flowering start date keep the veg ranges, and a marker
// shows where flowering began.

// each metric always on the same fixed scale, whatever the readings
const FIXED_SCALES: Record<Metric, { min: number; max: number }> = {
  // down to 15 °C: early mornings with the lights off get that cold
  temperature: { min: 15, max: 30 },
  humidity: { min: 30, max: 90 },
};

const TEMPERATURE_COLOR = COLORS.yellow;
const HUMIDITY_COLOR = COLORS.blue;
const FEED_COLOR = COLORS.green;
const FEED_BAR_WIDTH = 4;
const FLOWER_COLOR = COLORS.purple;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const HOUR_MS = 60 * 60 * 1000;
// the week is thinned to one point per 20 min, the day to every 4th reading
const WEEK_POINT_MS = 20 * 60 * 1000;
// room right of the newest reading, so it isn't glued to the frame
const PLOT_INSET_RIGHT = 24;
const DAY_STEP = 4;
// curve smoothing, same as the desktop chart (Chart.js tension)
const TENSION = 0.3;
// a press shorter and stiller than this is a tap (switches the range),
// anything else is a scrub
const TAP_MAX_MS = 250;
const TAP_MAX_MOVE = 6;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Metric = "temperature" | "humidity";

const PHASE_SAMPLE_MS = 5 * 60 * 1000;

interface Phase {
  from: number;
  to: number;
  targets: PhaseTargets;
}

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

// on/off wrap midnight
function isLightOn(time: number, on: string, off: string) {
  const date = new Date(time);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const onMinutes = toMinutes(on);
  const offMinutes = toMinutes(off);

  return onMinutes < offMinutes
    ? minutes >= onMinutes && minutes < offMinutes
    : minutes >= onMinutes || minutes < offMinutes;
}

// "YYYY-MM-DD" -> local midnight, null when unset or invalid
function parseStartDate(date: string | null) {
  if (!date) return null;

  const [year, month, day] = date.split("-").map(Number);
  const time = new Date(year, month - 1, day).getTime();

  return Number.isNaN(time) ? null : time;
}

// "YYYY-MM-DD HH:MM:SS" -> time, null when unset or malformed
function parseStartedAt(value: string | null) {
  if (!value?.includes(" ")) return null;

  const time = parseEspDate(value);

  return Number.isNaN(time) ? null : time;
}

// stretches of the same targets between start and end: veg (light on
// nonstop) before flowerFrom, flowering by the light schedule after it
function schedulePhases(
  start: number,
  end: number,
  on: string,
  off: string,
  flowerFrom: number,
) {
  const phases: Phase[] = [];

  for (let time = start; time < end; time += PHASE_SAMPLE_MS) {
    const targets =
      time < flowerFrom
        ? VEG_TARGETS.lightsOn
        : isLightOn(time, on, off)
          ? FLOWER_TARGETS.lightsOn
          : FLOWER_TARGETS.lightsOff;
    const last = phases[phases.length - 1];
    const to = Math.min(time + PHASE_SAMPLE_MS, end);

    if (last?.targets === targets) {
      last.to = to;
    } else {
      phases.push({ from: time, to, targets });
    }
  }

  return phases;
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
  const mode = useBoxStore((state) => state.mode);
  const lightsOn = useBoxStore((state) => state.scheduler.on);
  const lightsOff = useBoxStore((state) => state.scheduler.off);
  const floweringStart = useBoxStore((state) => state.flowering.startDate);
  const floweringStartedAt = useBoxStore((state) => state.flowering.startedAt);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [activeTime, setActiveTime] = useState<number | null>(null);
  const [range, setRange] = useState<"week" | "day">("day");
  const press = useRef({ x: 0, time: 0 });

  const allPoints = useMemo(
    () => rows.map((row) => ({ time: parseEspDate(row.datetime), row })),
    [rows],
  );
  const weekPoints = useMemo(
    () =>
      thin(rows, WEEK_POINT_MS).map((row) => ({
        time: parseEspDate(row.datetime),
        row,
      })),
    [rows],
  );

  const newest = allPoints[allPoints.length - 1]?.time ?? 0;

  // a full week / day back from the newest reading, so the grid is complete
  // even while history is short
  const start = newest - (range === "week" ? WEEK_MS : DAY_MS);
  const end = newest;

  const points = useMemo(() => {
    if (range === "week") {
      return weekPoints.filter(
        (point) => point.time >= start && point.time <= end,
      );
    }

    const day = allPoints.filter(
      (point) => point.time >= start && point.time <= end,
    );

    // every 4th reading, counted back from the newest so it stays on the plot
    return day.filter((_, index) => (day.length - 1 - index) % DAY_STEP === 0);
  }, [allPoints, weekPoints, range, start, end]);

  const plotWidth = Math.max(size.width - PLOT_INSET_RIGHT, 1);
  const x = (time: number) =>
    ((time - start) / Math.max(end - start, 1)) * plotWidth;

  // AUTO without a start date: the whole range counts as flowering
  const flowerFrom =
    mode === "AUTO"
      ? (parseStartedAt(floweringStartedAt) ??
        parseStartDate(floweringStart) ??
        -Infinity)
      : null;
  const flowerMarker =
    flowerFrom !== null && flowerFrom > start && flowerFrom <= end
      ? flowerFrom
      : null;

  const phases = useMemo(
    () =>
      flowerFrom !== null
        ? schedulePhases(start, end, lightsOn, lightsOff, flowerFrom)
        : [{ from: start, to: end, targets: VEG_TARGETS.lightsOn }],
    [flowerFrom, start, end, lightsOn, lightsOff],
  );

  const scales = points.length ? FIXED_SCALES : null;

  const y = (metric: Metric, value: number) => {
    if (!scales) return size.height / 2;

    const { min, max } = scales[metric];

    return size.height - ((value - min) / (max - min)) * size.height;
  };

  const chart = useMemo(() => {
    if (!size.width) return null;

    // cubic curve through the points, control points along the neighbours
    const toPath = (metric: Metric) => {
      const coords = points.map((point) => [
        x(point.time),
        y(metric, point.row[metric]),
      ]);

      return coords
        .map(([px, py], index) => {
          if (index === 0) return `M${px.toFixed(1)} ${py.toFixed(1)}`;

          const before = coords[Math.max(index - 2, 0)];
          const previous = coords[index - 1];
          const next = coords[Math.min(index + 1, coords.length - 1)];
          const c1x = previous[0] + (px - before[0]) * (TENSION / 2);
          const c1y = previous[1] + (py - before[1]) * (TENSION / 2);
          const c2x = px - (next[0] - previous[0]) * (TENSION / 2);
          const c2y = py - (next[1] - previous[1]) * (TENSION / 2);

          return `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}`;
        })
        .join(" ");
    };

    // optimal range of each metric, per light phase
    const blocks = phases.map((phase) => {
      const block = (metric: Metric) => {
        const top = y(metric, phase.targets[metric].max);

        return {
          y: top,
          height: y(metric, phase.targets[metric].min) - top,
        };
      };

      // the bands still run to the frame edges - no empty strips
      const from = phase.from <= start ? 0 : x(phase.from);
      const to = phase.to >= end ? size.width : x(phase.to);

      return {
        x: from,
        width: to - from,
        temperature: block("temperature"),
        humidity: block("humidity"),
      };
    });

    // grid lines: midnights for the week (label centred in the day column
    // that follows), every 3 h for the day (labels on 00 / 06 / 12 / 18)
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
      // full hours divisible by 3 within the last 24 h
      const mark = new Date(start);
      mark.setMinutes(0, 0, 0);
      mark.setHours(mark.getHours() + 3 - (mark.getHours() % 3));

      for (; mark.getTime() < end; mark.setHours(mark.getHours() + 3)) {
        const hour = mark.getHours();

        grid.push({
          time: mark.getTime(),
          label: hour % 6 === 0 ? String(hour).padStart(2, "0") : null,
          labelAt: mark.getTime(),
        });
      }
    }

    const feeds = feedingHistory
      .map((date) => Date.parse(date))
      .filter((time) => time >= start && time <= end);

    return {
      temperaturePath: toPath("temperature"),
      humidityPath: toPath("humidity"),
      blocks,
      grid,
      feeds,
    };
    // x/y only depend on size, range and the scales
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, phases, scales, size, feedingHistory, range, start, end]);

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

    const time = start + (locationX / plotWidth) * (end - start);
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
          {flowerMarker !== null && (
            <LegendItem color={FLOWER_COLOR} label="Flower" bar />
          )}
        </View>

        <Text style={styles.range}>
          {reading
            ? formatScrubTime(reading.time)
            : range === "week"
              ? "7 days"
              : "24 h"}
        </Text>
      </View>

      <View
        style={styles.plot}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {chart && (
          <Svg width={size.width} height={size.height} pointerEvents="none">
            {/* optimal ranges: humidity behind, temperature on top */}
            {chart.blocks.map((block) => (
              <Rect
                key={`humidity-${block.x}`}
                x={block.x}
                y={block.humidity.y}
                width={block.width}
                height={block.humidity.height}
                fill={HUMIDITY_COLOR}
                opacity={0.1}
              />
            ))}
            {chart.blocks.map((block) => (
              <Rect
                key={`temperature-${block.x}`}
                x={block.x}
                y={block.temperature.y}
                width={block.width}
                height={block.temperature.height}
                fill={TEMPERATURE_COLOR}
                opacity={0.16}
              />
            ))}

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

            {/* veg | flowering boundary */}
            {flowerMarker !== null && (
              <Line
                x1={x(flowerMarker)}
                x2={x(flowerMarker)}
                y1={0}
                y2={size.height}
                stroke={FLOWER_COLOR}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            )}

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
                  cy={y("humidity", reading.row.humidity)}
                  r={4}
                  fill={HUMIDITY_COLOR}
                  stroke={COLORS.surface}
                  strokeWidth={2}
                />
                <Circle
                  cx={x(reading.time)}
                  cy={y("temperature", reading.row.temperature)}
                  r={4}
                  fill={TEMPERATURE_COLOR}
                  stroke={COLORS.surface}
                  strokeWidth={2}
                />
              </>
            )}
          </Svg>
        )}

        {/* scale ends: temperature on the left, humidity on the right */}
        {scales && (
          <>
            <Text style={[styles.scaleText, styles.scaleTopLeft]}>
              {`${scales.temperature.max.toFixed(1)}°`}
            </Text>
            <Text style={[styles.scaleText, styles.scaleBottomLeft]}>
              {`${scales.temperature.min.toFixed(1)}°`}
            </Text>
            <Text style={[styles.scaleText, styles.scaleTopRight]}>
              {`${scales.humidity.max.toFixed(0)}%`}
            </Text>
            <Text style={[styles.scaleText, styles.scaleBottomRight]}>
              {`${scales.humidity.min.toFixed(0)}%`}
            </Text>
          </>
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
    paddingHorizontal: 16,
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

  scaleText: {
    position: "absolute",
    fontSize: 9,
    color: COLORS.textMuted,
  },

  scaleTopLeft: { top: 2, left: 3, color: TEMPERATURE_COLOR },
  scaleBottomLeft: { bottom: 2, left: 3, color: TEMPERATURE_COLOR },
  scaleTopRight: { top: 2, right: 3, color: HUMIDITY_COLOR },
  scaleBottomRight: { bottom: 2, right: 3, color: HUMIDITY_COLOR },

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
