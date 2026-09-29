# growbox-app

iOS app for a grow box driven by an ESP32 controller. It shows the box
climate and lets you run the light, the fan and the watering log from
your phone.

The firmware lives in
[growbox-firmware](https://github.com/umatik/growbox-firmware). The app
talks to its HTTP API over the local WiFi.

## Features

- **Live climate:** temperature and humidity, refreshed every 5 s.
- **History chart:** today's temperature and humidity against the target
  bands. History is synced from the controller's SD card and cached
  locally in SQLite.
- **Two modes**
  - **Manual (veg):** light and fan switches, fan speed slider, and
    **Auto fan**, where the controller sets the fan speed from the
    temperature.
  - **Auto (flowering):** light schedule, flowering week progress and
    the nutrient plan for the current week.
- **Watering log:** "Feeded" / "Feed me now!" stores each feeding on the
  controller, plus local reminders when a watering is late.
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
