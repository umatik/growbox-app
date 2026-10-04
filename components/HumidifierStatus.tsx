import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import { HumidifierState } from "@/store/boxStore";

const ICON_BOX = 50;
const ICON_OFF_COLOR = "#2a4a3e";

function getDetail(humidifier: HumidifierState) {
  if (!humidifier.online) return "offline";
  if (!humidifier.enabled) return "disabled";
  return `${humidifier.min}–${humidifier.max}%`;
}

// relay state reported by the mini ESP: right half of the fan card (row),
// or one column of the flowering card (column)
export default function HumidifierStatus({
  humidifier,
  column = false,
}: {
  humidifier: HumidifierState;
  column?: boolean;
}) {
  const isOn = humidifier.online && humidifier.on;
  const label = (
    <Text
      style={[styles.label, column && styles.labelColumn]}
      numberOfLines={1}
    >
      Humidifier
    </Text>
  );

  return (
    <View style={[styles.container, column && styles.containerColumn]}>
      {/* column: label above the icon, like the other flowering columns */}
      {column && label}

      <View style={[styles.iconBox, isOn && styles.iconBoxOn]}>
        <Ionicons
          name={isOn ? "water" : "water-outline"}
          size={24}
          color={isOn ? COLORS.blue : ICON_OFF_COLOR}
        />
      </View>

      <View style={[styles.info, column && styles.infoColumn]}>
        {!column && label}

        {!column && (
          <Text
            style={[styles.value, isOn && styles.valueOn]}
            numberOfLines={1}
          >
            {isOn ? "ON" : "OFF"}
          </Text>
        )}

        <Text
          style={[
            styles.detail,
            column && styles.detailColumn,
            !humidifier.online && styles.detailOffline,
          ]}
          numberOfLines={1}
        >
          {getDetail(humidifier)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: ICON_BOX / 2,
    borderWidth: 4,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxOn: {
    borderColor: COLORS.blue,
  },
  containerColumn: {
    flexDirection: "column",
    gap: 6,
  },
  // same type scale as the other flowering card columns
  labelColumn: {
    fontSize: 12,
  },
  detailColumn: {
    fontSize: 11,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  infoColumn: {
    flex: 0,
    alignItems: "center",
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  value: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "600",
  },
  valueOn: {
    color: COLORS.blue,
  },
  detail: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  detailOffline: {
    color: COLORS.red,
  },
});
