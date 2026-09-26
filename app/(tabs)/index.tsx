import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";

import AppShell from "@/components/AppShell";
import Sensor from "@/components/Sensor";
import FanSpeedCard from "@/components/FanSpeedCard";
import FeedingCard from "@/components/FeedingCard";
import VegNutrients from "@/components/VegNutrients";
import EnvironmentChart from "@/components/EnvironmentChart";
import FloweringRequired from "@/components/FloweringRequired";
import { useBoxStore } from "@/store";
import { useBoxControllerContext } from "@/context/BoxControllerContext";
import { COLORS } from "@/constants/Colors";

export default function HomeScreen() {
  const mode = useBoxStore((state) => state.mode);
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

  return (
    <AppShell title="Box Panel">
      {initialLoading && (
        <View style={styles.connectionContainer}>
          <ActivityIndicator size="large" color={COLORS.cyan} />

          <Text style={styles.connectionTitle}>Connecting...</Text>

          <Text style={styles.connectionText}>
            Connecting to Box Controller
          </Text>
        </View>
      )}

      {showConnectionError && (
        <View style={styles.connectionContainer}>
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
        </View>
      )}

      {!initialLoading && (!error || connectionDismissed) && (
        <View style={styles.content}>
          <Sensor />
          {mode === "MANUAL" ? (
            <>
              <EnvironmentChart />
              <FanSpeedCard />
              <VegNutrients />
              <FeedingCard />
            </>
          ) : (
            <>
              <FeedingCard />
              <FloweringRequired />
            </>
          )}
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  // grows to the screen height so the logo can push the cards to the bottom
  content: {
    flexGrow: 1,
    paddingBottom: 14,
  },

  connectionContainer: {
    flex: 1,
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
