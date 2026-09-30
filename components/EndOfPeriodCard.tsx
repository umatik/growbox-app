import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import { useBoxControllerContext } from "@/context/BoxControllerContext";
import { useBoxStore } from "@/store";
import { useFloweringProgress } from "@/hooks/useFloweringProgress";
import { clearRows } from "@/store/environmentDb";

// from week 9 there is nothing left to feed; this card replaces the
// nutrients schedule and closes the period: erases the sensor log and
// switches the box to Manual
export default function EndOfPeriodCard() {
  const { currentWeek } = useFloweringProgress();
  const mode = useBoxStore((state) => state.mode);
  const { eraseEnvironment, toggleMode } = useBoxControllerContext();

  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);

    try {
      await eraseEnvironment();
      await clearRows();
    } catch {
      Alert.alert(
        "Could not erase the logs",
        "Check the connection and try again.",
      );
      setSaving(false);
      return;
    }

    try {
      // the card only shows in Auto; the home screen follows the new mode
      if (mode === "AUTO") await toggleMode();
    } catch {
      Alert.alert(
        "Logs erased",
        "Could not switch to Manual. Switch the mode by hand.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    if (saving) return;

    Alert.alert(
      "Finish the period?",
      "This erases all sensor logs on the SD card and in the app, then switches the box to Manual.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Finish", style: "destructive", onPress: finish },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* ripe bud behind the content, its edges faded into the card */}
      <View pointerEvents="none" style={styles.backdrop}>
        <Image
          source={require("@/assets/images/bud.png")}
          style={styles.bud}
          resizeMode="cover"
        />

        <Svg width={BUD_WIDTH} height={BUD_HEIGHT} style={styles.budFade}>
          <Defs>
            <RadialGradient id="budFade" cx="50%" cy="45%" rx="50%" ry="55%">
              <Stop offset="0.25" stopColor={COLORS.surface} stopOpacity={0} />
              <Stop offset="0.7" stopColor={COLORS.surface} stopOpacity={0.6} />
              <Stop offset="0.95" stopColor={COLORS.surface} stopOpacity={1} />
            </RadialGradient>
          </Defs>

          <Rect width="100%" height="100%" fill="url(#budFade)" />
        </Svg>
      </View>

      {/* top left corner */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="flag-outline" size={26} color={COLORS.cyan} />
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Week {currentWeek} of 10</Text>

          <Text style={styles.value} numberOfLines={1}>
            End of period
          </Text>
        </View>
      </View>

      {/* bottom left corner */}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handleFinish}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={COLORS.surfaceLight} />
        ) : (
          <Text style={styles.buttonText}>Finish</Text>
        )}
      </Pressable>
    </View>
  );
}

// same layout as FeedingCard, as tall as the Nutrients schedule it replaces:
// borders 2 + padding 20 + header 22 + list margin 2 + 5 rows x 26
const NUTRIENTS_CARD_HEIGHT = 176;

// bud.png is 504 x 450; it fills the card height inside the border
const BUD_HEIGHT = NUTRIENTS_CARD_HEIGHT - 2;
const BUD_WIDTH = Math.round((BUD_HEIGHT * 504) / 450);

const styles = StyleSheet.create({
  container: {
    minHeight: NUTRIENTS_CARD_HEIGHT,
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    // text top left, button bottom left, both inside the card padding
    alignItems: "flex-start",
    justifyContent: "space-between",
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  // on the right, away from the text and the button
  bud: {
    position: "absolute",
    top: 0,
    right: 0,
    width: BUD_WIDTH,
    height: BUD_HEIGHT,
    opacity: 0.8,
  },

  // same box as the photo, fully opaque, or the photo's edge shows through
  budFade: {
    position: "absolute",
    top: 0,
    right: 0,
  },

  iconBox: {
    width: 34,
    alignItems: "center",
  },

  info: {
    alignItems: "flex-start",
  },

  label: {
    color: COLORS.textMuted,
    fontSize: 13,
  },

  value: {
    marginTop: 2,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
  },

  button: {
    minWidth: 76,
    height: 40,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.8,
  },

  buttonText: {
    color: COLORS.surfaceLight,
    fontSize: 15,
    fontWeight: "700",
  },
});
