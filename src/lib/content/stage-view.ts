import stageRatesJson from './data/stage-rates.json';
import type { StageRecord } from './schema';

type UnknownRecord = Record<string, unknown>;

export interface StageActorView {
  key: string;
  slug: string;
  name: string;
  portrait: string | null;
  spawnPct: number | null;
  hp: number;
  atk: number;
  gold: number;
  exp: number;
  damageMultiplier: number | null;
  hpMultiplier: number | null;
  goldMultiplier: number | null;
  expMultiplier: number | null;
}

export interface StageDropEntryView {
  label: string;
  chance: number;
  grade: string | null;
  level: string | null;
  itemIds: string[];
}

export interface StageDropView {
  kind: 'monster' | 'boss';
  label: string;
  rate: number;
  boxId: string;
  boxName: string;
  boxIcon: string | null;
  boxGrade: string;
  possibleRewards: number;
  entries: StageDropEntryView[];
}

export interface StageFirstClearRewardView {
  chance: number;
  heroId: string | null;
  itemId: string;
  name: string;
  grade: string;
  icon: string | null;
}

const stageRates = stageRatesJson as Record<string, { monsterRate: number; bossRate: number }>;

function object(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
}

function list(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(object).filter((entry) => Object.keys(entry).length > 0) : [];
}

function number(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function string(value: unknown, fallback = ''): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function nullableNumber(value: unknown): number | null {
  const parsed = Number(value);
  return value === null || value === undefined || !Number.isFinite(parsed) ? null : parsed;
}

function actor(value: unknown): StageActorView | null {
  const source = object(value);
  if (Object.keys(source).length === 0) return null;
  return {
    key: string(source.key),
    slug: string(source.slug),
    name: string(source.name, 'Unknown monster'),
    portrait: string(source.portrait) || null,
    spawnPct: nullableNumber(source.spawnPct),
    hp: number(source.hp),
    atk: number(source.atk),
    gold: number(source.gold),
    exp: number(source.exp),
    damageMultiplier: nullableNumber(source.dmgMult),
    hpMultiplier: nullableNumber(source.hpMult),
    goldMultiplier: nullableNumber(source.goldMult),
    expMultiplier: nullableNumber(source.expMult)
  };
}

export function stageActors(stage: StageRecord): { boss: StageActorView | null; monsters: StageActorView[] } {
  return {
    boss: actor(stage.source.boss),
    monsters: list(stage.source.monsters).map(actor).filter((entry): entry is StageActorView => entry !== null)
  };
}

function entryView(value: UnknownRecord): StageDropEntryView {
  const group = object(value.group);
  const item = object(value.item);
  const label = string(group.name_i18n ?? group.name ?? item.name_i18n ?? item.name ?? value.type, 'Unknown reward');
  const levelMatch = label.match(/Lv\s?(\d+)/i);
  const groupItemIds = Array.isArray(group.items) ? group.items.map((id) => string(id)).filter(Boolean) : [];
  const itemId = string(item.id ?? item.key);
  return {
    label,
    chance: number(value.pct),
    grade: string(group.grade ?? item.grade) || null,
    level: levelMatch?.[1] ?? null,
    itemIds: groupItemIds.length > 0 ? groupItemIds : itemId ? [itemId] : []
  };
}

export function stageDrops(stage: StageRecord): StageDropView[] {
  const root = object(stage.source.drops);
  const knownRates = stageRates[stage.id];
  return (['monster', 'boss'] as const).flatMap((kind) => {
    const section = object(root[kind]);
    const box = object(section.box);
    if (Object.keys(box).length === 0) return [];
    const table = object(section.table);
    const entries = list(table.entries).map(entryView);
    const supplementalRate = knownRates?.[`${kind}Rate` as 'monsterRate' | 'bossRate'];
    const fixtureRate = nullableNumber(table.pct ?? section.pct);
    const rate = supplementalRate === undefined ? (fixtureRate ?? 0) : supplementalRate / 10;
    return [{
      kind,
      label: kind === 'monster' ? 'Monster chest' : 'Boss chest',
      rate,
      boxId: string(box.id),
      boxName: string(box.name, kind === 'monster' ? 'Monster chest' : 'Boss chest'),
      boxIcon: string(box.icon) || null,
      boxGrade: string(box.grade, 'COMMON'),
      possibleRewards: entries.length,
      entries
    } satisfies StageDropView];
  });
}

export function stageFirstClearRewards(stage: StageRecord): StageFirstClearRewardView[] {
  const drops = object(stage.source.drops);
  const firstClear = object(drops.firstClear ?? stage.source.firstClear);
  return list(firstClear.entries).flatMap((entry) => {
    const item = object(entry.item);
    const itemId = string(item.id ?? item.key);
    if (!itemId) return [];
    const heroId = string(entry.hero);
    return [{
      chance: number(entry.pct),
      heroId: heroId || null,
      itemId,
      name: string(item.name_i18n ?? item.name, 'First-clear reward'),
      grade: string(item.grade, 'COMMON'),
      icon: string(item.icon) || null
    } satisfies StageFirstClearRewardView];
  });
}

export function stagePerWave(stage: StageRecord): number {
  return number(stage.source.perWave, stage.waves ? Math.max(1, Math.round(stage.kills / stage.waves)) : 0);
}

export function multiplier(value: number | null): string {
  return value === null ? '—' : `×${(value / 1000).toFixed(1)}`;
}

export function titleCase(value: string): string {
  return value.toLowerCase().replace(/(^|\s)(\w)/g, (match) => match.toUpperCase());
}
