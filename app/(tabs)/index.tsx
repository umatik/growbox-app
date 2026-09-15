import { ScrollView } from "react-native";
import { router } from "expo-router";
import AppShell from "@/components/AppShell";
import Sensor from "@/components/Sensor";
import FloweringSchedule from "@/components/FloweringSchedule";
import FertilizerSection from "@/components/FertilizerSection";
import FloweringRequired from "@/components/FloweringRequired";

export default function HomeScreen() {
  return (
    <AppShell
      title="Box Panel"
      showModeStatus
      onModePress={() => router.push("/mode")}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Sensor />
        <FloweringRequired />
      </ScrollView>
    </AppShell>
  );
}
