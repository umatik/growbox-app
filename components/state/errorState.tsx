import { StyleSheet } from "react-native";
import StateMessage from "@/components/state/stateMessage";

type ErrorStateProps = {
  message: string;
};

const ErrorState = ({ message }: ErrorStateProps) => {
  return <StateMessage>{message}</StateMessage>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ErrorState;
