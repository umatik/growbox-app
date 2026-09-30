import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Text from "@/components/AppText";
import SlideToConfirm from "@/components/SlideToConfirm";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import { useBoxControllerContext } from "@/context/BoxControllerContext";
import { useFeedingStatus } from "@/hooks/useFeedingStatus";

const DAY_MS = 24 * 60 * 60 * 1000;

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
  // the frame follows the watering status in both modes, like the
  // flowering progress bar: green on time, yellow late, red missed
  const borderColor =
    status === "overdue"
      ? COLORS.red
      : status === "late"
        ? COLORS.yellow
        : COLORS.green;
  const { logFeeding } = useBoxControllerContext();

  const [saving, setSaving] = useState(false);
  // the buttons only open a slide-to-confirm sheet, so a stray tap can't
  // log a watering
  const [confirming, setConfirming] = useState(false);

  const handleFed = async () => {
    if (saving) return;

    try {
      setSaving(true);
      await logFeeding(new Date().toISOString());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setConfirming(false);
    } catch {
      // Error is handled by the controller.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const openConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfirming(true);
  };

  const closeConfirm = () => {
    if (!saving) setConfirming(false);
  };

  const confirmSheet = (
    <Modal
      visible={confirming}
      transparent
      animationType="fade"
      onRequestClose={closeConfirm}
    >
      <Pressable style={styles.backdrop} onPress={closeConfirm}>
        {/* taps on the sheet itself must not close it */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Log a feeding?</Text>
            <Pressable
              onPress={closeConfirm}
              hitSlop={12}
              disabled={saving}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Ionicons name="close" size={24} color={COLORS.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.sheetText}>
            Slide to save today&apos;s watering on the controller.
          </Text>

          <SlideToConfirm
            label="Slide to feed"
            onConfirm={handleFed}
            loading={saving}
            color={status === "overdue" ? COLORS.red : COLORS.green}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );

  // a missed watering turns the whole card into one big call to action
  if (status === "overdue") {
    return (
      <>
        <Pressable
          style={({ pressed }) => [styles.feedNow, pressed && styles.pressed]}
          onPress={openConfirm}
        >
          <Ionicons name="water" size={24} color={COLORS.text} />
          <Text style={styles.feedNowText}>Feed me now!</Text>
        </Pressable>

        {confirmSheet}
      </>
    );
  }

  return (
    <View style={[styles.container, { borderColor }]}>
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
        onPress={openConfirm}
      >
        <Text style={styles.buttonText}>Feeded</Text>
      </Pressable>

      {confirmSheet}
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

  feedNow: {
    marginHorizontal: 16,
    marginTop: 14,
    height: 66,
    borderRadius: 16,
    backgroundColor: COLORS.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  feedNowText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },

  buttonText: {
    color: COLORS.surfaceLight,
    fontSize: 15,
    fontWeight: "700",
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },

  sheet: {
    margin: 12,
    marginBottom: 34,
    padding: 20,
    gap: 16,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sheetTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },

  sheetText: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
});
