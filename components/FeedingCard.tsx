import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import { useBoxControllerContext } from "@/context/BoxControllerContext";
import { useFeedingStatus } from "@/hooks/useFeedingStatus";

const DAY_MS = 24 * 60 * 60 * 1000;
// the ESP firmware has no POST /feeding yet, so the button does nothing
// until it does
const FEEDING_ENABLED = false;

function getLastFedLabel(lastFedAt: string | null) {
  if (!lastFedAt) return "Never";

  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const fedDay = new Date(lastFedAt).setHours(0, 0, 0, 0);
  const days = Math.round((startOfToday - fedDay) / DAY_MS);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function FeedingCard() {
  const lastFedAt = useBoxStore((state) => state.feeding.lastFedAt);
  const count = useBoxStore((state) => state.feeding.count);
  const mode = useBoxStore((state) => state.mode);
  const { status } = useFeedingStatus();

  // Manual has no week progress bar, so the card itself shows a late (yellow)
  // or missed (red) watering; in Auto the flowering progress bar does
  const warningColor =
    mode !== "MANUAL" || status === "ok"
      ? null
      : status === "overdue"
        ? COLORS.red
        : COLORS.yellow;
  const { logFeeding } = useBoxControllerContext();

  const [saving, setSaving] = useState(false);

  const handleFed = async () => {
    if (!FEEDING_ENABLED || saving) return;

    try {
      setSaving(true);
      await logFeeding(new Date().toISOString());
    } catch {
      // Error is handled by the controller.
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={[styles.container, warningColor && { borderColor: warningColor }]}
    >
      <View style={styles.iconBox}>
        <Ionicons
          name="water-outline"
          size={26}
          color={warningColor ?? COLORS.blue}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.label}>Last fed</Text>

        <Text
          style={[styles.value, warningColor && { color: warningColor }]}
          numberOfLines={1}
        >
          {getLastFedLabel(lastFedAt)}
          <Text style={styles.count}>
            {" "}
            · {count} {count === 1 ? "feed" : "feeds"}
          </Text>
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handleFed}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={COLORS.surfaceLight} />
        ) : (
          <Text style={styles.buttonText}>Feeded</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconBox: {
    width: 34,
    alignItems: "center",
  },

  info: {
    flex: 1,
    minWidth: 0,
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

  count: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "400",
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
