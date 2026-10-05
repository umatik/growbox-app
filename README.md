# growbox-app

iOS app for a grow box driven by an ESP32 controller. It shows the box
climate and lets you run the light, the fan and the watering log from
your phone.

The firmware lives in
[growbox-firmware](https://github.com/umatik/growbox-firmware). The app
talks to its HTTP API over the local WiFi.

## Features

- **Live climate:** temperature and humidity, refreshed every 5 s.
- **History chart:** the last 24 h (tap: 7 days) of temperature and
  humidity against the target bands - veg ranges before the flowering
  start, flowering ranges by the light schedule after it, with a purple
  "Flower" line where flowering began. Temperature scale 15-30 °C.
  History is synced from the controller's SD card every 5 min and cached
  locally in SQLite.
- **Two modes**
  - **Manual (veg):** light and fan switches, fan speed slider, and
    **Auto fan**, where the controller sets the fan speed from the
    temperature. The home card shows the fan and the humidifier side by
    side.
  - **Auto (flowering):** light schedule, one card with the flowering
    week (ring = how much of the week is gone), the fan and the
    humidifier, and the nutrient plan for the current week.
- **Humidifier:** ON / OFF from the mini ESP in the humidifier, the band
  of the current mode, "offline" when the mini doesn't answer.
- **Fan:** live level; a fan stopped by its relay (e.g. night fan off)
  shows "off" with the level it is set to.
- **Watering log:** "Feeded" / "Feed me now!" stores each feeding on the
  controller, plus local reminders when a watering is late. After a
  watering the button turns into a "Feeded" badge for 24 h; the frame
  turns yellow when the next one is late and red when it is missed.
- **Flaky WiFi handling:** only several missed polls in a row count as a
  lost connection, and the app reconnects on its own.
- **Offline mode:** a built-in mock controller with generated data, for
  UI work without the hardware.

## Stack

Expo SDK 57 (React Native 0.86, dev client), Expo Router, Zustand,
NativeWind, react-native-svg / Reanimated, expo-sqlite,
expo-notifications.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values, see below
npm run sim:mock       # simulator with mock data, no hardware needed
npm run sim:esp        # simulator against the real controller
```

A free Apple ID signs the app for 7 days only - after that it has to be
installed again (a paid developer account removes the limit).

The native `ios/` and `android/` folders are generated (`npx expo
prebuild`) and are not committed. `npx expo run:ios` builds and installs
the dev client. Add `--device` for a phone and `--configuration Release`
for a standalone build.

### Environment

| Variable                   | Meaning                                                 |
| -------------------------- | ------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`      | Controller API, e.g. `http://192.168.1.50/api`          |
| `EXPO_PUBLIC_API_TOKEN`    | Bearer token, the same as `API_TOKEN` in the firmware   |
| `EXPO_PUBLIC_OFFLINE_MODE` | `true` uses the mock controller instead of the ESP      |

`.env` is git-ignored. Keep the token out of commits.

## Project layout

```
app/          screens (Expo Router): Home, Scheduler, Settings
components/   cards and controls (fan gauge, chart, feeding card, ...)
context/      BoxControllerContext - polling, connection state, actions
store/        Zustand store and the SQLite history cache
hooks/        history sync, feeding status, reminders, layout helpers
data/         grow targets and the fertilizer schedule
shared/       controller API: types, HTTP service, useEsp hook
mocks/        mock controller for offline mode
```

## Credits

Built by [Mac Umatik](https://github.com/umatik) together with
[Claude](https://claude.com/claude-code), Anthropic's AI coding assistant.
We design, code and debug it side by side.
