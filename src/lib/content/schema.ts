export const CONTENT_KINDS = [
  'gear',
  'grade',
  'material',
  'effect',
  'stage',
  'stageBox',
  'monster',
  'skill',
  'passiveSkill',
  'rune',
  'buff',
  'statusEffect',
  'hero',
  'pet',
  'mechanic',
  'achievement',
  'news'
] as const;

export type ContentKind = (typeof CONTENT_KINDS)[number];

export const SOURCE_GRADE_ORDER = [
  'COMMON',
  'UNCOMMON',
  'RARE',
  'LEGENDARY',
  'IMMORTAL',
  'ARCANA',
  'BEYOND',
  'CELESTIAL',
  'DIVINE',
  'COSMIC'
] as const;

export type GradeId = (typeof SOURCE_GRADE_ORDER)[number];

export const SOURCE_GEAR_TYPES = [
  'SWORD',
  'BOW',
  'STAFF',
  'SCEPTER',
  'CROSSBOW',
  'AXE',
  'SHIELD',
  'ARROW',
  'ORB',
  'TOME',
  'BOLT',
  'HATCHET',
  'HELMET',
  'ARMOR',
  'GLOVES',
  'BOOTS',
  'AMULET',
  'BRACER',
  'EARING',
  'RING'
] as const;

export type GearType = (typeof SOURCE_GEAR_TYPES)[number];
export type GearGroup = 'Weapon' | 'Off-hand' | 'Armor' | 'Accessory';

export interface EntityRef {
  kind: ContentKind;
  id: string;
}

export interface StatLine {
  label: string;
  value: string | number;
  unit?: string;
}

export interface EntityBase<K extends ContentKind = ContentKind> {
  kind: K;
  id: string;
  slug: string;
  name: string;
  summary: string;
  image: string | null;
  searchTerms: string[];
  relations: EntityRef[];
  source: Record<string, unknown>;
}

export interface GradeRecord extends EntityBase<'grade'> {
  gradeId: GradeId;
  order: number;
}

export interface GearRecord extends EntityBase<'gear'> {
  gradeId: GradeId;
  gearType: GearType;
  gearGroup: GearGroup;
  level: number;
  obtainable: boolean;
  sellGold: number;
  cubeExp: number;
  stats: StatLine[];
}

export interface MaterialRecord extends EntityBase<'material'> {
  gradeId: GradeId;
  materialType: string;
  hasEffects: boolean;
  effectGroups: Record<string, unknown>;
}

export interface StageBoxRecord extends EntityBase<'stageBox'> {
  gradeId: GradeId;
  drop: Record<string, unknown>;
}

export interface StageRecord extends EntityBase<'stage'> {
  act: number;
  number: number;
  level: number;
  difficulty: string;
  waves: number | null;
  kills: number;
  goldPerClear: number;
  expPerClear: number;
  mapPosition: Record<string, unknown>;
}

export interface MonsterRecord extends EntityBase<'monster'> {
  monsterType: string;
  rewardGold: number;
  rewardExp: number;
  stats: StatLine[];
}

export interface SkillRecord extends EntityBase<'skill'> {
  heroIds: string[];
  activation: string;
  element: string;
  range: number;
  maxLevel: number;
  cooldownSeconds: number | null;
  stats: StatLine[];
}

export interface PassiveSkillRecord extends EntityBase<'passiveSkill'> {
  heroIds: string[];
  stats: StatLine[];
}

export interface RuneRecord extends EntityBase<'rune'> {
  maxLevel: number;
  stats: StatLine[];
}

export interface BuffRecord extends EntityBase<'buff'> {
  buffType: string;
  stats: StatLine[];
}

export interface StatusEffectRecord extends EntityBase<'statusEffect'> {
  durationSeconds: number | null;
  stats: StatLine[];
}

export interface HeroRecord extends EntityBase<'hero'> {
  role: string;
  stats: StatLine[];
  attributes: Record<string, unknown>[];
}

export interface PetRecord extends EntityBase<'pet'> {
  role: string;
  unlockCondition: string;
  stats: StatLine[];
}

export interface ReferenceRecord
  extends EntityBase<'effect' | 'mechanic' | 'achievement' | 'news'> {}

export type ContentRecord =
  | GradeRecord
  | GearRecord
  | MaterialRecord
  | StageBoxRecord
  | StageRecord
  | MonsterRecord
  | SkillRecord
  | PassiveSkillRecord
  | RuneRecord
  | BuffRecord
  | StatusEffectRecord
  | HeroRecord
  | PetRecord
  | ReferenceRecord;

export interface ContentFamilyCounts {
  gear: number;
  grade: number;
  material: number;
  stageBox: number;
  stage: number;
  monster: number;
  skill: number;
  passiveSkill: number;
  rune: number;
  buff: number;
  statusEffect: number;
  hero: number;
  pet: number;
  materialEffects: number;
}

export interface ContentFeatures {
  portalMap: Record<string, unknown>;
  runeTree: Record<string, unknown>;
  monsterAnimations: Record<string, unknown>;
  references: Record<string, unknown>;
  unavailableGearCombinations: string[];
}

export interface ContentCatalog {
  version: 1;
  siteName: string;
  locale: 'en-US';
  gradeOrder: GradeId[];
  gearTypeOrder: GearType[];
  counts: ContentFamilyCounts;
  records: ContentRecord[];
  features: ContentFeatures;
}
