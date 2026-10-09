import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useBoxStore } from "@/store";
import { LATE_AFTER_DAYS, OVERDUE_AFTER_DAYS } from "@/hooks/useFeedingStatus";

// the yellow reminder fires in the evening, when watering usually happens
const REMINDER_HOUR = 19;

// once red, the alert repeats every 2 h during the day, for up to a week
// (iOS keeps at most 64 scheduled notifications per app)
const ALERT_FIRST_HOUR = 8;
const ALERT_LAST_HOUR = 22;
const ALERT_EVERY_HOURS = 2;
const ALERT_DAYS = 7;

const ID_PREFIX = "watering-";
const LATE_ID = `${ID_PREFIX}late`;

// show reminders as banners even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// local midnight of the day `days` after `time`, then `hour`
function reminderAt(time: number, days: number, hour: number) {
  const date = new Date(time);

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  date.setHours(hour);

  return date;
}

async function cancelAll() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((request) => request.identifier.startsWith(ID_PREFIX))
      .map((request) =>
        Notifications.cancelScheduledNotificationAsync(request.identifier),
      ),
  );
}

async function schedule(
  identifier: string,
  date: Date,
  content: Notifications.NotificationContentInput,
) {
  // a reminder whose time has passed is not re-fired on every sync
  if (date.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content,
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

// Local reminders, rescheduled whenever the last feeding changes: a gentle
// one on day 3 (yellow), then from day 4 (red) a time-sensitive alert
// (breaks through Focus) every 2 h until the plant is fed. No server needed -
// iOS fires them even with the app closed.
export function useWateringReminders() {
  const lastFedAt = useBoxStore((state) => state.feeding.lastFedAt);

  useEffect(() => {
    const sync = async () => {
      const { granted } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      });

      if (!granted) return;

      await cancelAll();

      // nothing recorded yet: there is no date to count from
      if (!lastFedAt) return;

      const fedAt = Date.parse(lastFedAt);

      await schedule(
        LATE_ID,
        reminderAt(fedAt, LATE_AFTER_DAYS, REMINDER_HOUR),
        {
          title: "Time to water",
          body: `Last watering was ${LATE_AFTER_DAYS} days ago.`,
        },
      );

      for (let day = 0; day < ALERT_DAYS; day++) {
        const days = OVERDUE_AFTER_DAYS + day;

        for (
          let hour = ALERT_FIRST_HOUR;
          hour <= ALERT_LAST_HOUR;
          hour += ALERT_EVERY_HOURS
        ) {
          await schedule(
            `${ID_PREFIX}overdue-${day}-${hour}`,
            reminderAt(fedAt, days, hour),
            {
              title: "Watering missed",
              body: `The plant hasn't been watered for ${days} days. Feed it now!`,
              interruptionLevel: "timeSensitive",
            },
          );
        }
      }
    };

    sync().catch(() => {
      // reminders are best effort; the app shows the status anyway
    });
  }, [lastFedAt]);
}
