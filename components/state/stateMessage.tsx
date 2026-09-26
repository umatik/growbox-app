import { View, StyleSheet } from "react-native";
import Text from "@/components/AppText";

const StateMessage = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.container}>
    <Text>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StateMessage;
