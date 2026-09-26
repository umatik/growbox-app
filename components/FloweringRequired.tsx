import { Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";
import FloweringSchedule from "@/components/FloweringSchedule";
import FertilizerSection from "@/components/FertilizerSection";
import { useBoxControllerContext } from "@/context/BoxControllerContext";

export default function FloweringRequired() {
  const mode = useBoxStore((state) => state.mode);
  const startDate = useBoxStore((state) => state.flowering.startDate);
  const setFlowering = useBoxStore((state) => state.setFlowering);
  const setMode = useBoxStore((state) => state.setMode);
  const { setFloweringStartDate } = useBoxControllerContext();

  const handleStart = async () => {
    const date = new Date().toISOString().slice(0, 10);

    await setFloweringStartDate(date);

    setMode("AUTO");

    setFlowering({
      startDate: date,
      currentWeek: 1,
      progress: 0,
    });
  };

  // flowering is Auto-only; Manual home has no card for it
  if (mode !== "AUTO") {
    return null;
  }

  if (!startDate) {
    return (
      <View style={styles.infoCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="leaf-outline" size={22} color={COLORS.green} />
        </View>

        <Text style={styles.infoTitle}>Start flowering first</Text>

        <Text style={styles.infoText}>
          Start flowering in Auto mode to see the flowering schedule and
          nutrients.
        </Text>

        <Pressable style={styles.startButton} onPress={handleStart}>
          <Ionicons name="leaf-outline" size={23} color={COLORS.surfaceLight} />

          <Text style={styles.startButtonText}>Start flowering</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <FloweringSchedule />
      <FertilizerSection />
    </>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  iconCircle: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  infoIcon: {
    width: "100%",
    height: "100%",
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
  },

  infoText: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  startButton: {
    width: "100%",
    height: 52,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  startButtonText: {
    color: COLORS.surfaceLight,
    fontSize: 15,
    fontWeight: "700",
  },
});
