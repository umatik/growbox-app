import { useWindowDimensions } from "react-native";

// 320pt wide: iPhone SE 1st gen or mini / SE with Display Zoom "Larger Text"
const COMPACT_WIDTH = 360;

export function useCompactLayout() {
  const { width } = useWindowDimensions();

  return width < COMPACT_WIDTH;
}
