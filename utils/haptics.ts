import * as Haptics from "expo-haptics";

export const { ImpactFeedbackStyle, NotificationFeedbackType } = Haptics;

// Haptics are a nicety: a dev client built without the native module, or
// a call the system refuses, must never break the action behind them.
function safely(run: () => Promise<void>) {
  try {
    run().catch(() => {});
  } catch {
    // native module missing
  }
}

export const impact = (style: Haptics.ImpactFeedbackStyle) =>
  safely(() => Haptics.impactAsync(style));

export const notify = (type: Haptics.NotificationFeedbackType) =>
  safely(() => Haptics.notificationAsync(type));

export const selection = () => safely(() => Haptics.selectionAsync());
