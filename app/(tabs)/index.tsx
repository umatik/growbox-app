import { ScrollView } from "react-native";
import { router } from "expo-router";
import AppShell from "@/components/AppShell";
import Sensor from "@/components/Sensor";
import ModeSelector from "@/components/ModeSelector";
import StatusCard from "@/components/StatusCard";
import FloweringSchedule from "@/components/FloweringSchedule";
import DeviceStatus from "@/components/DeviceStatus";
import FertilizerSection from "@/components/FertilizerSection";

export default function HomeScreen() {
  return (
    <AppShell title="Box Panel" onModePress={() => router.push("/mode")}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Sensor />
        <FloweringSchedule currentWeek={1} />
        <FertilizerSection currentWeek={1} />
      </ScrollView>
    </AppShell>
  );
}
