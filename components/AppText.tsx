import { Text as RNText, TextProps } from "react-native";

// caps Dynamic Type so large accessibility sizes don't break card layouts
export const MAX_FONT_SCALE = 1.3;

export default function Text({
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...props
}: TextProps) {
  return <RNText maxFontSizeMultiplier={maxFontSizeMultiplier} {...props} />;
}
