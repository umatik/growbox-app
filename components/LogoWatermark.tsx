import { Image, StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

const LOGO_SIZE = 110;
const GLOW_WIDTH = 400;
const GLOW_HEIGHT = 550;
const ACCENT = "#1aff5c";

// fills the free space between cards; logo sits in its centre
export default function LogoWatermark() {
  return (
    <View pointerEvents="none" style={styles.container}>
      {/* glow is larger than the space, so it spills under the cards around it */}
      <View style={styles.glow}>
        <Svg width={GLOW_WIDTH} height={GLOW_HEIGHT}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={ACCENT} stopOpacity={0.14} />
              <Stop offset="0.5" stopColor={ACCENT} stopOpacity={0.07} />
              <Stop offset="1" stopColor={ACCENT} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          <Ellipse
            cx={GLOW_WIDTH / 2}
            cy={GLOW_HEIGHT / 2}
            rx={GLOW_WIDTH / 2}
            ry={GLOW_HEIGHT / 2}
            fill="url(#glow)"
          />
        </Svg>
      </View>

      <Image
        source={require("@/assets/images/sprout.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // zIndex -1 keeps the glow behind the neighbouring cards
  // marginTop mirrors the next card's marginTop so the logo sits dead centre
  container: {
    flexGrow: 1,
    marginTop: 14,
    minHeight: LOGO_SIZE + 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },

  glow: {
    position: "absolute",
    width: GLOW_WIDTH,
    height: GLOW_HEIGHT,
  },

  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    opacity: 0.5,
  },
});
