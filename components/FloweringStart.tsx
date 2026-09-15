import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/Colors";
import { useBoxStore } from "@/store";

export default function FloweringStart() {
  const startDate = useBoxStore((state) => state.flowering.startDate);

  const setFlowering = useBoxStore((state) => state.setFlowering);

  const handleStart = () => {
    const date = new Date().toISOString().slice(0, 10);

    setFlowering({
      startDate: date,
      currentWeek: 1,
      progress: 0,
    });
  };

  const handleReset = () => {
    setFlowering({
      startDate: null,
      currentWeek: 1,
      progress: 0,
    });
  };

  if (!startDate) {
    return (
      <Pressable style={styles.startButton} onPress={handleStart}>
        <Ionicons name="leaf-outline" size={25} color={COLORS.text} />

        <Text style={styles.startButtonText}>Start flowering</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.controlCard}>
      <View style={styles.iconBox}>
        <Ionicons name="leaf-outline" size={25} color={COLORS.green} />
      </View>

      <View style={styles.controlText}>
        <Text style={styles.controlTitle}>Flowering start</Text>

        <Text style={styles.status}>{startDate}, Week 1</Text>
      </View>

      <View style={styles.switchBox}>
        <Pressable onPress={handleReset} hitSlop={8}>
          <Ionicons name="close-circle" size={30} color={COLORS.red} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  startButton: {
    height: 58,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  startButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },

  controlCard: {
    minHeight: 66,
    paddingLeft: 14,
    paddingRight: 20,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 34,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  controlText: {
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
  },

  controlTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  status: {
    marginTop: 2,
    color: COLORS.green,
    fontSize: 12,
  },

  switchBox: {
    width: 52,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
