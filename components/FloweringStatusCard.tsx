import { StyleSheet, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import { useFloweringProgress } from "@/hooks/useFloweringProgress";
import { useFeedingStatus } from "@/hooks/useFeedingStatus";
import FanGauge, { GAUGE_SIZE } from "@/components/FanGauge";
import HumidifierStatus from "@/components/HumidifierStatus";

const TOTAL_WEEKS = 10;
const FLUSH_WEEK = 9;
const HARVEST_WEEK = 10;
const FLUSH_COLOR = "#91C6CC";
const HARVEST_COLOR = "#B3DFAE";

const RADIUS = 21;
const THIN_STROKE = 2;
const THICK_STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function weekColor(week: number) {
  if (week === FLUSH_WEEK) return FLUSH_COLOR;
  if (week >= HARVEST_WEEK) return HARVEST_COLOR;
  return COLORS.green;
}

// week number in a thin ring; the part of the week already gone is drawn
// thick (half a week = half the ring thick)
function WeekRing({
  week,
  progress,
  color,
}: {
  week: number;
  progress: number;
  color: string;
}) {
  const done = Math.min(1, Math.max(0, progress / 100));
  const center = GAUGE_SIZE / 2;

  return (
    <View style={styles.ring}>
      <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke={color}
          strokeWidth={THIN_STROKE}
          opacity={0.5}
          fill="none"
        />

        <G rotation={-90} origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={RADIUS}
            stroke={color}
            strokeWidth={THICK_STROKE}
            strokeLinecap={done > 0 && done < 1 ? "round" : "butt"}
            strokeDasharray={`${CIRCUMFERENCE * done} ${CIRCUMFERENCE}`}
            fill="none"
          />
        </G>
      </Svg>

      <Text style={[styles.weekNumber, { color }]}>{week}</Text>
    </View>
  );
}

// AUTO (flowering) home: week, fan and humidifier side by side
export default function FloweringStatusCard() {
  const { currentWeek, progress } = useFloweringProgress();
  // late watering turns the ring yellow, a missed one red
  const { status } = useFeedingStatus();
  const fanLevel = useBoxStore((state) => state.devices.fanLevel);
  const humidifier = useBoxStore((state) => state.humidifier);

  const week = Math.min(currentWeek, TOTAL_WEEKS);
  const pct = Math.round(Math.min(100, Math.max(0, fanLevel)));
  const ringColor =
    status === "overdue"
      ? COLORS.red
      : status === "late"
        ? COLORS.yellow
        : weekColor(week);

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.label} numberOfLines={1}>
          Week
        </Text>
        <WeekRing week={week} progress={progress} color={ringColor} />
        <View style={styles.info}>
          <Text style={styles.detail} numberOfLines={1}>
            {week === FLUSH_WEEK
              ? "flush"
              : week >= HARVEST_WEEK
                ? "harvest"
                : `of ${TOTAL_WEEKS} · ${Math.round(progress)}%`}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.column}>
        <Text style={styles.label} numberOfLines={1}>
          Fan
        </Text>
        <FanGauge pct={pct} />
        <View style={styles.info}>
          <Text style={styles.detail} numberOfLines={1}>
            {pct === 0 ? "off" : "auto"}
          </Text>
        </View>
      </View>

      {humidifier && (
        <>
          <View style={styles.divider} />
          <View style={styles.column}>
            <HumidifierStatus humidifier={humidifier} column />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 6,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: COLORS.border,
  },
  ring: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  weekNumber: {
    position: "absolute",
    fontSize: 18,
    fontWeight: "700",
  },
  info: {
    alignItems: "center",
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  detail: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
