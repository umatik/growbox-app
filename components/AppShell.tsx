import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";

interface AppShellProps {
  children: ReactNode;
  title: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function AppShell({
  children,
  title,
  onRefresh,
  refreshing = false,
}: AppShellProps) {
  const mode = useBoxStore((state) => state.mode);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.modeStatus}>
          <Text style={styles.modeLabel}>MODE</Text>
          <Text style={styles.modeValue}>{mode}</Text>
        </View>

        {onRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh-outline"
              size={22}
              color={refreshing ? COLORS.textMuted : COLORS.text}
            />
          </TouchableOpacity>
        )}
      </View>

      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "700",
  },

  modeStatus: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "flex-end",
    gap: 5,
    marginRight: 8,
  },

  modeLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },

  modeValue: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "700",
  },

  refreshButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
