import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";

interface AppShellProps {
  children: ReactNode;
  title: string;
  showModeButton?: boolean;
  onModePress?: () => void;
}

export default function AppShell({
  children,
  title,
  showModeButton = true,
  onModePress,
}: AppShellProps) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>

        {showModeButton && (
          <TouchableOpacity
            style={styles.modeButton}
            onPress={onModePress}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={27} color={COLORS.text} />
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
    justifyContent: "space-between",
  },
  title: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "700",
  },
  modeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
