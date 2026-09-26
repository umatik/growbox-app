import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "@/components/AppText";
import { useFonts } from "expo-font";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import "../global.css";

import { BoxControllerProvider } from "@/context/BoxControllerContext";
import { useBoxControllerContext } from "@/context/BoxControllerContext";
import { useBoxStore } from "@/store";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function ConnectionOverlay() {
  const lastConnectedMode = useBoxStore((state) => state.lastConnectedMode);

  const {
    initialLoading,
    loading,
    error,
    connectionDismissed,
    dismissConnectionError,
    reloadConnection,
  } = useBoxControllerContext();

  const showConnectionError =
    !initialLoading && !loading && Boolean(error) && !connectionDismissed;

  const showOkButton = showConnectionError && lastConnectedMode === "AUTO";

  if (!initialLoading && !showConnectionError) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      {initialLoading ? (
        <>
          <ActivityIndicator size="large" color={COLORS.cyan} />

          <Text style={styles.connectionTitle}>Connecting...</Text>

          <Text style={styles.connectionText}>
            Connecting to Box Controller
          </Text>
        </>
      ) : (
        <>
          <Ionicons
            name="warning-outline"
            size={42}
            color={COLORS.yellow}
            style={styles.connectionIcon}
          />

          <Text style={styles.connectionTitle}>ESP32 disconnected</Text>

          <Text style={styles.connectionText}>
            Unable to connect to Box Controller
          </Text>

          <TouchableOpacity
            style={styles.reloadButton}
            onPress={reloadConnection}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <Text style={styles.reloadButtonText}>RELOAD</Text>
            )}
          </TouchableOpacity>

          {showOkButton && (
            <TouchableOpacity
              style={styles.okButton}
              onPress={dismissConnectionError}
              activeOpacity={0.8}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

function AppContent() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      <ConnectionOverlay />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <BoxControllerProvider>
        <AppContent />
      </BoxControllerProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    elevation: 999,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  connectionIcon: {
    marginBottom: 14,
  },

  connectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 18,
    textAlign: "center",
  },

  connectionText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },

  reloadButton: {
    minWidth: 120,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: COLORS.cyan,
    alignItems: "center",
  },

  reloadButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "700",
  },

  okButton: {
    minWidth: 120,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    alignItems: "center",
  },

  okButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "700",
  },
});
