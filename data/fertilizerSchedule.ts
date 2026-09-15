export interface FertilizerDose {
  name: string;
  dosage: number | null;
  color: string;
}

export const FERTILIZER_SCHEDULE: Record<number, FertilizerDose[]> = {
  // Our Week 1 = BioBizz Week 3
  1: [
    { name: "BIO·GROW", dosage: 2, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 1, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 1, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 2, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 2, color: "#78BFFF" },
  ],

  // Our Week 2 = BioBizz Week 4
  2: [
    { name: "BIO·GROW", dosage: 2, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 2, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 1, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 2, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 2, color: "#78BFFF" },
  ],

  // Our Week 3 = BioBizz Week 5
  3: [
    { name: "BIO·GROW", dosage: 3, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 2, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 1, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 3, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 3, color: "#78BFFF" },
  ],

  // Our Week 4 = BioBizz Week 6
  4: [
    { name: "BIO·GROW", dosage: 3, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 3, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 1, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 4, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 4, color: "#78BFFF" },
  ],

  // Our Week 5 = BioBizz Week 7
  5: [
    { name: "BIO·GROW", dosage: 4, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 3, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 1, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 4, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 4, color: "#78BFFF" },
  ],

  // Our Week 6 = BioBizz Week 8
  6: [
    { name: "BIO·GROW", dosage: 4, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 4, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 4, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 5, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 5, color: "#78BFFF" },
  ],

  // Our Week 7 = BioBizz Week 9
  7: [
    { name: "BIO·GROW", dosage: 4, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 4, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 4, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 5, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 5, color: "#78BFFF" },
  ],

  // Our Week 8 = BioBizz Week 10
  8: [
    { name: "BIO·GROW", dosage: 4, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 4, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 4, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 5, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 5, color: "#78BFFF" },
  ],

  // Our Week 9 = BioBizz Week 11
  9: [
    { name: "BIO·GROW", dosage: 4, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 4, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 4, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 5, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 5, color: "#78BFFF" },
  ],

  // Our Week 10 = BioBizz Week 12
  10: [
    { name: "BIO·GROW", dosage: 4, color: "#00E95A" },
    { name: "BIO·BLOOM", dosage: 4, color: "#FF6070" },
    { name: "TOP·MAX", dosage: 4, color: "#FF6070" },
    { name: "ACTI·VERA", dosage: 5, color: "#B18CFF" },
    { name: "BIO·HEAVEN", dosage: 5, color: "#78BFFF" },
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
