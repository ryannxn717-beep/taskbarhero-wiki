export type CubeOperationSlug =
  | 'synthesis'
  | 'alchemy'
  | 'crafting'
  | 'decoration'
  | 'extraction'
  | 'engraving'
  | 'offering'
  | 'inscription';

export type CubeGrade =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Legendary'
  | 'Immortal'
  | 'Arcana'
  | 'Beyond'
  | 'Celestial'
  | 'Divine'
  | 'Cosmic';

export interface CubeOperation {
  slug: CubeOperationSlug;
  path: `/${CubeOperationSlug}`;
  name: string;
  unlockLevel: number;
  unlockCost: number;
  icon: string;
  summary: string;
}

export interface ProbabilityOutcome {
  grade: CubeGrade;
  chance: number;
  note?: 'same' | 'great success';
}

export interface SynthesisOddsRow {
  inputGrade: CubeGrade;
  outcomes: readonly ProbabilityOutcome[];
}

export interface CraftingTier {
  tier: number;
  levelRange: string;
  cubeLevel: number;
  cost: number;
  outcomes: readonly ProbabilityOutcome[];
}

export interface EnchantmentOperation {
  slug: 'decoration' | 'engraving' | 'inscription';
  materialCount: number;
  slotGrades: readonly { grade: CubeGrade; slots: number }[];
  statPool: readonly { stat: string; weapon?: string; armor?: string; accessory?: string; all?: string }[];
}

export interface ExtractionCost {
  tier: number;
  decoration: number;
  engraving: number;
  inscription: number;
}

export interface OfferingCoin {
  rank: number;
  name: string;
  materialId: string;
  cost: number;
  outcomes: readonly ProbabilityOutcome[];
}

const icon = (file: string) => `/game/ui/${file}`;

export const cubeOperations: readonly CubeOperation[] = Object.freeze([
  { slug: 'synthesis', path: '/synthesis', name: 'Synthesis', unlockLevel: 0, unlockCost: 0, icon: icon('Icon_Cube_Synthesis.png'), summary: 'Synthesize 9 items of the same grade.' },
  { slug: 'alchemy', path: '/alchemy', name: 'Alchemy', unlockLevel: 1, unlockCost: 10, icon: icon('Icon_Cube_Category1_Alchemy.png'), summary: 'Convert any item into gold.' },
  { slug: 'crafting', path: '/crafting', name: 'Crafting', unlockLevel: 5, unlockCost: 100, icon: icon('Icon_Cube_Crafting.png'), summary: 'Craft a random item for a selected gear slot.' },
  { slug: 'decoration', path: '/decoration', name: 'Decoration', unlockLevel: 8, unlockCost: 300, icon: icon('Icon_Cube_Decoration.png'), summary: 'Grant a special stat to equipment.' },
  { slug: 'extraction', path: '/extraction', name: 'Extraction', unlockLevel: 10, unlockCost: 1_000, icon: icon('Icon_Cube_Detach.png'), summary: 'Remove an applied stat and reopen its slot.' },
  { slug: 'engraving', path: '/engraving', name: 'Engraving', unlockLevel: 15, unlockCost: 1_000, icon: icon('Icon_Cube_Engraving.png'), summary: 'Grant a stronger special stat to equipment.' },
  { slug: 'offering', path: '/offering', name: 'Offering', unlockLevel: 20, unlockCost: 3_000, icon: icon('Icon_Cube_Offering.png'), summary: 'Offer a commemorative coin for random gear.' },
  { slug: 'inscription', path: '/inscription', name: 'Inscription', unlockLevel: 25, unlockCost: 10_000, icon: icon('Icon_Cube_Inscription.png'), summary: 'Grant a premium special stat to equipment.' }
]);

export const gradeGoldAndExp = Object.freeze([
  { grade: 'Common', gold: 10, exp: 2 },
  { grade: 'Uncommon', gold: 30, exp: 6 },
  { grade: 'Rare', gold: 90, exp: 18 },
  { grade: 'Legendary', gold: 270, exp: 54 },
  { grade: 'Immortal', gold: 810, exp: 162 },
  { grade: 'Arcana', gold: 2_592, exp: 518 },
  { grade: 'Beyond', gold: 8_294, exp: 1_658 },
  { grade: 'Celestial', gold: 29_029, exp: 5_803 },
  { grade: 'Divine', gold: 101_602, exp: 20_311 },
  { grade: 'Cosmic', gold: 355_607, exp: 71_089 }
] satisfies readonly { grade: CubeGrade; gold: number; exp: number }[]);

export const cubeItemLevelFactors = Object.freeze([
  { level: 1, factor: 1 }, { level: 5, factor: 10 }, { level: 10, factor: 40 },
  { level: 15, factor: 120 }, { level: 20, factor: 240 }, { level: 25, factor: 408 },
  { level: 30, factor: 612 }, { level: 35, factor: 816 }, { level: 40, factor: 1_020 },
  { level: 45, factor: 1_224 }, { level: 50, factor: 1_428 }, { level: 55, factor: 1_632 },
  { level: 60, factor: 1_836 }, { level: 65, factor: 2_040 }, { level: 70, factor: 2_244 },
  { level: 75, factor: 2_448 }, { level: 80, factor: 2_652 }, { level: 85, factor: 2_856 },
  { level: 90, factor: 3_060 }
]);

export const cubeGearTypeFactors = Object.freeze([
  { type: 'Amulet', factor: 4 }, { type: 'Earing', factor: 3 }, { type: 'Ring', factor: 3 },
  { type: 'Bracer', factor: 3 }, { type: 'Arrow', factor: 2 }, { type: 'Orb', factor: 2 },
  { type: 'Shield', factor: 2 }, { type: 'Bolt', factor: 2 }, { type: 'Hatchet', factor: 2 },
  { type: 'Tome', factor: 2 }, { type: 'Sword', factor: 1 }, { type: 'Axe', factor: 1 },
  { type: 'Bow', factor: 1 }, { type: 'Crossbow', factor: 1 }, { type: 'Scepter', factor: 1 },
  { type: 'Staff', factor: 1 }, { type: 'Armor', factor: 1 }, { type: 'Helmet', factor: 0.8 },
  { type: 'Gloves', factor: 0.75 }, { type: 'Boots', factor: 0.7 }
]);

export const cubeItemTypeFactors = Object.freeze([
  { type: 'Material', factor: 12 },
  { type: 'Gear', factor: 1 }
]);

export const synthesisOdds: readonly SynthesisOddsRow[] = Object.freeze([
  { inputGrade: 'Common', outcomes: [{ grade: 'Uncommon', chance: 95 }, { grade: 'Rare', chance: 4.8, note: 'great success' }] },
  { inputGrade: 'Uncommon', outcomes: [{ grade: 'Rare', chance: 96 }, { grade: 'Legendary', chance: 3.8, note: 'great success' }] },
  { inputGrade: 'Rare', outcomes: [{ grade: 'Legendary', chance: 98 }, { grade: 'Immortal', chance: 2.4, note: 'great success' }] },
  { inputGrade: 'Legendary', outcomes: [{ grade: 'Immortal', chance: 99 }, { grade: 'Arcana', chance: 0.99, note: 'great success' }] },
  { inputGrade: 'Immortal', outcomes: [{ grade: 'Immortal', chance: 50, note: 'same' }, { grade: 'Arcana', chance: 50 }, { grade: 'Beyond', chance: 0.25, note: 'great success' }] },
  { inputGrade: 'Arcana', outcomes: [{ grade: 'Arcana', chance: 67, note: 'same' }, { grade: 'Beyond', chance: 33 }, { grade: 'Celestial', chance: 0.17, note: 'great success' }] },
  { inputGrade: 'Beyond', outcomes: [{ grade: 'Beyond', chance: 77, note: 'same' }, { grade: 'Celestial', chance: 23 }, { grade: 'Divine', chance: 0.08, note: 'great success' }] },
  { inputGrade: 'Celestial', outcomes: [{ grade: 'Celestial', chance: 83, note: 'same' }, { grade: 'Divine', chance: 17 }, { grade: 'Cosmic', chance: 0.02, note: 'great success' }] },
  { inputGrade: 'Divine', outcomes: [{ grade: 'Divine', chance: 91, note: 'same' }, { grade: 'Cosmic', chance: 9.1 }] }
]);

export const craftingTiers: readonly CraftingTier[] = Object.freeze([
  { tier: 1, levelRange: 'Lv 1–10', cubeLevel: 1, cost: 0, outcomes: [{ grade: 'Uncommon', chance: 50 }, { grade: 'Rare', chance: 40 }, { grade: 'Legendary', chance: 8 }, { grade: 'Immortal', chance: 2 }] },
  { tier: 2, levelRange: 'Lv 10–20', cubeLevel: 10, cost: 100, outcomes: [{ grade: 'Uncommon', chance: 30 }, { grade: 'Rare', chance: 52 }, { grade: 'Legendary', chance: 13 }, { grade: 'Immortal', chance: 4.5 }, { grade: 'Arcana', chance: 0.5 }] },
  { tier: 3, levelRange: 'Lv 20–30', cubeLevel: 20, cost: 500, outcomes: [{ grade: 'Uncommon', chance: 18.01 }, { grade: 'Rare', chance: 56.01 }, { grade: 'Legendary', chance: 18.01 }, { grade: 'Immortal', chance: 7 }, { grade: 'Arcana', chance: 0.9 }, { grade: 'Beyond', chance: 0.07 }] },
  { tier: 4, levelRange: 'Lv 30–40', cubeLevel: 30, cost: 1_000, outcomes: [{ grade: 'Uncommon', chance: 11 }, { grade: 'Rare', chance: 55 }, { grade: 'Legendary', chance: 23 }, { grade: 'Immortal', chance: 9 }, { grade: 'Arcana', chance: 1.8 }, { grade: 'Beyond', chance: 0.2 }] },
  { tier: 5, levelRange: 'Lv 40–50', cubeLevel: 40, cost: 3_000, outcomes: [{ grade: 'Uncommon', chance: 7 }, { grade: 'Rare', chance: 53 }, { grade: 'Legendary', chance: 26 }, { grade: 'Immortal', chance: 11 }, { grade: 'Arcana', chance: 2.8 }, { grade: 'Beyond', chance: 0.2 }] },
  { tier: 6, levelRange: 'Lv 50–65', cubeLevel: 50, cost: 5_000, outcomes: [{ grade: 'Uncommon', chance: 1.5 }, { grade: 'Rare', chance: 51.5 }, { grade: 'Legendary', chance: 29 }, { grade: 'Immortal', chance: 14 }, { grade: 'Arcana', chance: 3.8 }, { grade: 'Beyond', chance: 0.2 }] },
  { tier: 7, levelRange: 'Lv 65–80', cubeLevel: 60, cost: 7_000, outcomes: [{ grade: 'Rare', chance: 49.5 }, { grade: 'Legendary', chance: 30 }, { grade: 'Immortal', chance: 16.5 }, { grade: 'Arcana', chance: 3.8 }, { grade: 'Beyond', chance: 0.2 }] },
  { tier: 8, levelRange: 'Lv 80–90', cubeLevel: 70, cost: 10_000, outcomes: [{ grade: 'Rare', chance: 48 }, { grade: 'Legendary', chance: 30 }, { grade: 'Immortal', chance: 18 }, { grade: 'Arcana', chance: 3.8 }, { grade: 'Beyond', chance: 0.2 }] }
]);

const decorationStats = Object.freeze([
  { stat: 'Add HP Per Hit', weapon: 'T3–10' },
  { stat: 'All Elemental Resistance', armor: 'T5–10' },
  { stat: 'Area Of Effect', weapon: 'T6', accessory: 'T2–7' },
  { stat: 'Armor', armor: 'T1–8' },
  { stat: 'Attack Damage', weapon: 'T3–10', accessory: 'T1–9' },
  { stat: 'Attack Speed', weapon: 'T3–10', accessory: 'T1–8' },
  { stat: 'Block Chance', armor: 'T1–8' },
  { stat: 'Cold Damage Percent', weapon: 'T2–10' },
  { stat: 'Cooldown Reduction', weapon: 'T3–9', armor: 'T3–10', accessory: 'T2–9' },
  { stat: 'Critical Chance', weapon: 'T3–10', accessory: 'T2–10' },
  { stat: 'Critical Damage', weapon: 'T3–10', accessory: 'T3–10' },
  { stat: 'Fire Damage Percent', weapon: 'T2–10' }
]);

const engravingStats = Object.freeze([
  { stat: 'Add HP Per Hit', weapon: 'T4–10', accessory: 'T1–7' },
  { stat: 'Area Of Effect', weapon: 'T3–10', accessory: 'T6' },
  { stat: 'Armor', armor: 'T1–9' },
  { stat: 'Attack Damage', weapon: 'T2–10', accessory: 'T2–10' },
  { stat: 'Attack Speed', weapon: 'T2–10', accessory: 'T1–8' },
  { stat: 'Block Chance', armor: 'T1–9' },
  { stat: 'Cold Damage Percent', weapon: 'T1–10' },
  { stat: 'Cooldown Reduction', weapon: 'T2–10', armor: 'T2–10', accessory: 'T1–10' },
  { stat: 'Critical Chance', weapon: 'T2–10', accessory: 'T1–10' },
  { stat: 'Critical Damage', weapon: 'T2–10', accessory: 'T2–10' }
]);

const inscriptionStats = Object.freeze([
  { stat: 'Add HP Per Hit', all: 'T3–10' },
  { stat: 'Add HP Per Kill', all: 'T1–9' },
  { stat: 'All Elemental Resistance', all: 'T10' },
  { stat: 'Area Of Effect', all: 'T1–10' },
  { stat: 'Armor', all: 'T1–10' },
  { stat: 'Attack Damage', all: 'T1–10' },
  { stat: 'Attack Speed', all: 'T1–10' },
  { stat: 'Block Chance', all: 'T1–10' },
  { stat: 'Cooldown Reduction', all: 'T1–10' },
  { stat: 'Critical Chance', all: 'T1–10' }
]);

export const enchantmentOperations: readonly EnchantmentOperation[] = Object.freeze([
  {
    slug: 'decoration', materialCount: 36,
    slotGrades: [{ grade: 'Rare', slots: 1 }, { grade: 'Legendary', slots: 2 }, { grade: 'Immortal', slots: 2 }, { grade: 'Arcana', slots: 2 }, { grade: 'Beyond', slots: 2 }, { grade: 'Celestial', slots: 2 }, { grade: 'Divine', slots: 2 }, { grade: 'Cosmic', slots: 2 }],
    statPool: decorationStats
  },
  {
    slug: 'engraving', materialCount: 33,
    slotGrades: [{ grade: 'Immortal', slots: 1 }, { grade: 'Arcana', slots: 1 }, { grade: 'Beyond', slots: 2 }, { grade: 'Celestial', slots: 2 }, { grade: 'Divine', slots: 2 }, { grade: 'Cosmic', slots: 2 }],
    statPool: engravingStats
  },
  {
    slug: 'inscription', materialCount: 10,
    slotGrades: [{ grade: 'Arcana', slots: 1 }, { grade: 'Beyond', slots: 1 }, { grade: 'Celestial', slots: 2 }, { grade: 'Divine', slots: 2 }, { grade: 'Cosmic', slots: 2 }],
    statPool: inscriptionStats
  }
]);

const decorationCosts = [100, 200, 400, 800, 1_500, 3_000, 6_000, 12_000, 25_000, 50_000];
export const extractionCosts: readonly ExtractionCost[] = Object.freeze(
  decorationCosts.map((decoration, index) => ({
    tier: index + 1,
    decoration,
    engraving: decoration * 2,
    inscription: decoration * 4
  }))
);

export const offeringCoins: readonly OfferingCoin[] = Object.freeze([
  { rank: 1, name: 'Kingdom 1st Anniversary Coin', materialId: '151001', cost: 10, outcomes: [{ grade: 'Common', chance: 2.4 }, { grade: 'Uncommon', chance: 12 }, { grade: 'Rare', chance: 28 }, { grade: 'Legendary', chance: 35 }, { grade: 'Immortal', chance: 21 }] },
  { rank: 2, name: 'Empire 1st Anniversary Coin', materialId: '151002', cost: 110, outcomes: [{ grade: 'Uncommon', chance: 9.5 }, { grade: 'Rare', chance: 23 }, { grade: 'Legendary', chance: 31 }, { grade: 'Immortal', chance: 23 }, { grade: 'Arcana', chance: 12 }, { grade: 'Celestial', chance: 0.7 }] },
  { rank: 3, name: 'Kingdom 10th Anniversary Coin', materialId: '151003', cost: 210, outcomes: [{ grade: 'Uncommon', chance: 2.7 }, { grade: 'Rare', chance: 14 }, { grade: 'Legendary', chance: 28 }, { grade: 'Immortal', chance: 28 }, { grade: 'Arcana', chance: 17 }, { grade: 'Beyond', chance: 6.6 }, { grade: 'Celestial', chance: 2.7 }] },
  { rank: 4, name: 'Empire 10th Anniversary Coin', materialId: '151004', cost: 310, outcomes: [{ grade: 'Uncommon', chance: 1.7 }, { grade: 'Legendary', chance: 17 }, { grade: 'Immortal', chance: 31 }, { grade: 'Arcana', chance: 27 }, { grade: 'Beyond', chance: 14 }, { grade: 'Celestial', chance: 9.4 }] },
  { rank: 5, name: 'Kingdom 50th Anniversary Coin', materialId: '151005', cost: 410, outcomes: [{ grade: 'Immortal', chance: 21 }, { grade: 'Arcana', chance: 30 }, { grade: 'Beyond', chance: 26 }, { grade: 'Celestial', chance: 20 }, { grade: 'Divine', chance: 3.1 }] },
  { rank: 6, name: 'Empire 50th Anniversary Coin', materialId: '151006', cost: 510, outcomes: [{ grade: 'Arcana', chance: 42 }, { grade: 'Beyond', chance: 25 }, { grade: 'Celestial', chance: 29 }, { grade: 'Divine', chance: 3.3 }, { grade: 'Cosmic', chance: 0.6 }] },
  { rank: 7, name: 'Kingdom 100th Anniversary Coin', materialId: '151007', cost: 610, outcomes: [{ grade: 'Beyond', chance: 51 }, { grade: 'Celestial', chance: 40 }, { grade: 'Divine', chance: 8.4 }, { grade: 'Cosmic', chance: 1.1 }] },
  { rank: 8, name: 'Empire 100th Anniversary Coin', materialId: '151008', cost: 710, outcomes: [{ grade: 'Celestial', chance: 80 }, { grade: 'Divine', chance: 17 }, { grade: 'Cosmic', chance: 2.9 }] },
  { rank: 9, name: 'Sacred Kingdom 1000th Anniversary Coin', materialId: '151009', cost: 810, outcomes: [{ grade: 'Celestial', chance: 15 }, { grade: 'Divine', chance: 79 }, { grade: 'Cosmic', chance: 5.8 }] },
  { rank: 10, name: 'Eternal Empire 1000th Anniversary Coin', materialId: '151010', cost: 910, outcomes: [{ grade: 'Celestial', chance: 18 }, { grade: 'Cosmic', chance: 82 }] }
]);

export const cubeLevelMilestones = Object.freeze([
  { level: 1, totalExp: 0 }, { level: 5, totalExp: 405 }, { level: 8, totalExp: 2_255 },
  { level: 10, totalExp: 4_955 }, { level: 15, totalExp: 26_805 }, { level: 20, totalExp: 106_055 },
  { level: 25, totalExp: 306_305 }, { level: 50, totalExp: 8_832_555 },
  { level: 75, totalExp: 61_983_805 }, { level: 100, totalExp: 234_760_055 }
]);

function assertProbabilityRows(label: string, rows: readonly { outcomes: readonly ProbabilityOutcome[] }[]) {
  for (const [index, row] of rows.entries()) {
    if (row.outcomes.length === 0) throw new Error(`${label}[${index}] has no outcomes`);
    const total = row.outcomes.reduce((sum, outcome) => sum + outcome.chance, 0);
    if (!Number.isFinite(total) || total < 98 || total > 101) {
      throw new Error(`${label}[${index}] probability total ${total} is outside the public rounded range`);
    }
  }
}

export function validateCubeData() {
  if (cubeOperations.length !== 8) throw new Error(`cubeOperations length ${cubeOperations.length}; expected 8`);
  const paths = new Set<string>();
  let previousLevel = -1;
  for (const operation of cubeOperations) {
    if (paths.has(operation.path)) throw new Error(`duplicate Cube route ${operation.path}`);
    paths.add(operation.path);
    if (operation.unlockLevel < previousLevel) throw new Error(`Cube unlock order regressed at ${operation.path}`);
    if (operation.unlockCost < 0) throw new Error(`negative Cube unlock cost ${operation.unlockCost}`);
    previousLevel = operation.unlockLevel;
  }
  if (synthesisOdds.length !== 9) throw new Error(`synthesisOdds length ${synthesisOdds.length}; expected 9`);
  if (craftingTiers.length !== 8) throw new Error(`craftingTiers length ${craftingTiers.length}; expected 8`);
  if (extractionCosts.length !== 10) throw new Error(`extractionCosts length ${extractionCosts.length}; expected 10`);
  if (offeringCoins.length !== 10) throw new Error(`offeringCoins length ${offeringCoins.length}; expected 10`);
  assertProbabilityRows('synthesisOdds', synthesisOdds);
  assertProbabilityRows('craftingTiers', craftingTiers);
  assertProbabilityRows('offeringCoins', offeringCoins);
  return { operations: cubeOperations.length, probabilityRows: synthesisOdds.length + craftingTiers.length + offeringCoins.length };
}

validateCubeData();
