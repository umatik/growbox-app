import { StyleSheet } from "react-native";
import StateMessage from "@/components/state/stateMessage";

type EmptyStateProps = {
  message: string;
};

const EmptyState = ({ message }: EmptyStateProps) => {
  return <StateMessage>{message}</StateMessage>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default EmptyState;
