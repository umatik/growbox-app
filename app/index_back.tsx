import { StyleSheet, Switch } from "react-native";
import { Text, View } from "@/components/Themed";
import { useEffect, useState } from "react";
import LoadingState from "@/components/state/loadingState";
import useEsp from "@box-controller/shared/hooks/useEsp";
import Slider from "@react-native-community/slider";

export default function TabOneScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
  const apiToken = process.env.EXPO_PUBLIC_API_TOKEN ?? "";

  const {
    fetchConfig,
    data,
    loading,
    toggleLight,
    toggleFan,
    toggleMode,
    toggleDisplay,
  } = useEsp({ apiUrl, apiToken });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  const light: boolean = Boolean(data?.config.relayLight.state);
  const fan: boolean = Boolean(data?.config.relayFan.state);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      {data && (
        <Text>
          Temperature: {data.sensor.temperature}°C{"\n"}
          Humidity: {data.sensor.humidity}%{"\n"}
          Mode: {data.status.mode}%{"\n"}
        </Text>
      )}

      <View style={styles.switchRow}>
        <Text>Display</Text>
        <Switch
          value={data?.config.display.enabled}
          onValueChange={toggleDisplay}
        />
      </View>

      <View style={styles.switchRow}>
        <Text>Auto mode</Text>
        <Switch
          value={data?.status.mode === "AUTO"}
          onValueChange={toggleMode}
        />
      </View>

      <View style={styles.switchRow}>
        <Text>Light</Text>
        <Switch value={light} onValueChange={toggleLight} />
      </View>

      <View style={styles.switchRow}>
        <Text>Fan</Text>
        <Switch value={fan} onValueChange={toggleFan} />
      </View>

      <View style={{ width: 250 }}>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={50}
          onValueChange={() => {}}
        />
      </View>

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 30,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
