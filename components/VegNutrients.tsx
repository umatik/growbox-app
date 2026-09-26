import { StyleSheet, View } from "react-native";
import Text from "@/components/AppText";
import { COLORS } from "@/constants/Colors";
import { VEG_NUTRIENTS } from "@/data/fertilizerSchedule";

export default function VegNutrients() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrients schedule</Text>

      <View style={styles.list}>
        {VEG_NUTRIENTS.map((nutrient, index) => (
          <View
            key={nutrient.name}
            style={[
              styles.row,
              index === VEG_NUTRIENTS.length - 1 && styles.lastRow,
            ]}
          >
            <Text style={[styles.name, { color: nutrient.color }]}>
              {nutrient.name}
            </Text>

            <Text style={[styles.dosage, { color: nutrient.color }]}>
              {nutrient.dosage} ml
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
  },

  list: {
    marginTop: 6,
  },

  row: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  name: {
    flexShrink: 1,
    marginRight: 12,
    fontSize: 16,
    fontWeight: "700",
  },

  dosage: {
    fontSize: 18,
    fontWeight: "600",
  },
});
