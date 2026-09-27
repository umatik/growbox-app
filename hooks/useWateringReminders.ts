import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useBoxStore } from "@/store";
import { AUTO_THRESHOLDS, MANUAL_THRESHOLDS } from "@/hooks/useFeedingStatus";

// reminders fire in the evening, when watering usually happens
const REMINDER_HOUR = 19;

const LATE_ID = "watering-late";
const OVERDUE_ID = "watering-overdue";

// show reminders as banners even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// local midnight of the day `days` after `time`, then REMINDER_HOUR
function reminderAt(time: number, days: number) {
  const date = new Date(time);

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  date.setHours(REMINDER_HOUR);

  return date;
}

async function schedule(
  identifier: string,
  date: Date,
  content: Notifications.NotificationContentInput,
) {
  await Notifications.cancelScheduledNotificationAsync(identifier);

  // a reminder whose time has passed is not re-fired on every sync
  if (date.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content,
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

// Local reminders, rescheduled whenever the last feeding or the mode
// changes: a gentle one when watering is late, a time-sensitive one (breaks
// through Focus) when it was missed. No server needed - iOS fires them even
// with the app closed.
export function useWateringReminders() {
  const lastFedAt = useBoxStore((state) => state.feeding.lastFedAt);
  const mode = useBoxStore((state) => state.mode);

  useEffect(() => {
    const thresholds = mode === "MANUAL" ? MANUAL_THRESHOLDS : AUTO_THRESHOLDS;

    const sync = async () => {
      const { granted } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      });

      if (!granted) return;

      // nothing recorded yet: there is no date to count from
      if (!lastFedAt) {
        await Notifications.cancelScheduledNotificationAsync(LATE_ID);
        await Notifications.cancelScheduledNotificationAsync(OVERDUE_ID);
        return;
      }

      const fedAt = Date.parse(lastFedAt);

      await schedule(LATE_ID, reminderAt(fedAt, thresholds.lateAfterDays), {
        title: "Time to water",
        body: `Last watering was ${thresholds.lateAfterDays} days ago.`,
      });

      await schedule(
        OVERDUE_ID,
        reminderAt(fedAt, thresholds.overdueAfterDays),
        {
          title: "Watering missed",
          body: `The plant hasn't been watered for ${thresholds.overdueAfterDays} days.`,
          interruptionLevel: "timeSensitive",
        },
      );
    };

    sync().catch(() => {
      // reminders are best effort; the app shows the status anyway
    });
  }, [lastFedAt, mode]);
}
