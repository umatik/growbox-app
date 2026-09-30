export interface FertilizerDose {
  name: string;
  dosage: number | null;
  color: string;
}

// BioBizz bottle label colours (sampled from the product range), same hue
// but lighter and more saturated so they read on the app's dark cards
export const NUTRIENT_COLORS: Record<string, string> = {
  "ROOT·JUICE": "#B08982",
  "BIO·GROW": "#76BC7A",
  "FISH·MIX": "#4A95E8",
  "BIO·BLOOM": "#F1604C",
  "TOP·MAX": "#D85A61",
  "BIO·HEAVEN": "#5CCAD6",
  "ALG·A·MIC": "#53DF74",
  "ACTI·VERA": "#9BC86A",
};

// Manual (vegetative) feeding = BioBizz Week 2, per 1 L of water
export const VEG_NUTRIENTS: FertilizerDose[] = [
  { name: "BIO·GROW", dosage: 2, color: NUTRIENT_COLORS["BIO·GROW"] },
  { name: "BIO·HEAVEN", dosage: 2, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
  { name: "ACTI·VERA", dosage: 2, color: NUTRIENT_COLORS["ACTI·VERA"] },
];

export const FERTILIZER_SCHEDULE: Record<number, FertilizerDose[]> = {
  // Our Week 1 = BioBizz Week 3
  1: [
    { name: "BIO·GROW", dosage: 2, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 1, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 1, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 2, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 2, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],

  // Our Week 2 = BioBizz Week 4
  2: [
    { name: "BIO·GROW", dosage: 2, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 2, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 1, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 2, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 2, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],

  // Our Week 3 = BioBizz Week 5
  3: [
    { name: "BIO·GROW", dosage: 3, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 2, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 1, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 3, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 3, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],

  // Our Week 4 = BioBizz Week 6
  4: [
    { name: "BIO·GROW", dosage: 3, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 3, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 1, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 4, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 4, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],

  // Our Week 5 = BioBizz Week 7
  5: [
    { name: "BIO·GROW", dosage: 4, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 3, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 1, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 4, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 4, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],

  // Our Week 6 = BioBizz Week 8
  6: [
    { name: "BIO·GROW", dosage: 4, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 4, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 4, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 5, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 5, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],

  // Our Week 7 = BioBizz Week 9
  7: [
    { name: "BIO·GROW", dosage: 4, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 4, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 4, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 5, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 5, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],

  // Our Week 8 = BioBizz Week 10
  8: [
    { name: "BIO·GROW", dosage: 4, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 4, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 4, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 5, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 5, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],

  // Our Week 9 = BioBizz Week 11
  9: [
    { name: "BIO·GROW", dosage: 4, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 4, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 4, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 5, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 5, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],

  // Our Week 10 = BioBizz Week 12
  10: [
    { name: "BIO·GROW", dosage: 4, color: NUTRIENT_COLORS["BIO·GROW"] },
    { name: "BIO·BLOOM", dosage: 4, color: NUTRIENT_COLORS["BIO·BLOOM"] },
    { name: "TOP·MAX", dosage: 4, color: NUTRIENT_COLORS["TOP·MAX"] },
    { name: "BIO·HEAVEN", dosage: 5, color: NUTRIENT_COLORS["BIO·HEAVEN"] },
    { name: "ACTI·VERA", dosage: 5, color: NUTRIENT_COLORS["ACTI·VERA"] },
  ],
};

export const BIOBIZZ_WEEK_BY_OUR_WEEK: Record<number, number> = {
  1: 3,
  2: 4,
  3: 5,
  4: 6,
  5: 7,
  6: 8,
  7: 9,
  8: 10,
  9: 11,
  10: 12,
};
