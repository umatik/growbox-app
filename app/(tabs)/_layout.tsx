import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useBoxControllerContext } from "@/context/BoxControllerContext";

export default function TabLayout() {
  const { tabsDisabled } = useBoxControllerContext();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },

        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.textMuted,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="scheduler"
        options={{
          title: "Scheduler",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),

          tabBarButton: ({
            onPress,
            onLongPress,
            accessibilityState,
            accessibilityLabel,
            testID,
            style,
            children,
          }) => (
            <Pressable
              onPress={tabsDisabled ? undefined : onPress}
              onLongPress={tabsDisabled ? undefined : onLongPress}
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
              disabled={tabsDisabled}
              style={[style, tabsDisabled && styles.disabledTab]}
            >
              {children}
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),

          tabBarButton: ({
            onPress,
            onLongPress,
            accessibilityState,
            accessibilityLabel,
            testID,
            style,
            children,
          }) => (
            <Pressable
              onPress={tabsDisabled ? undefined : onPress}
              onLongPress={tabsDisabled ? undefined : onLongPress}
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
              disabled={tabsDisabled}
              style={[style, tabsDisabled && styles.disabledTab]}
            >
              {children}
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  disabledTab: {
    opacity: 0.35,
  },
});
