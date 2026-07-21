import { stageActors, stageDrops } from '$lib/content/stage-view';
import type { GearRecord, HeroRecord, MaterialRecord, StageBoxRecord, StageRecord } from '$lib/content/schema';
import type { BisGearCandidate, BisStat } from './bis';
import type { DropSource, DropSourceEntry } from './drops';
import type { FarmingStageCandidate } from './farming';

type UnknownRecord = Record<string, unknown>;

export interface ToolItemOption {
  itemId: number;
  name: string;
  href: string;
}

export interface ToolHeroOption {
  id: string;
  name: string;
}

export interface ToolDamageStage {
  id: string;
  name: string;
  enemyHit: number;
}

function object(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
}

function list(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(object).filter((row) => Object.keys(row).length > 0) : [];
}

function finite(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function titleCase(value: string): string {
  return value.toLowerCase().replace(/(^|[_\s-])(\w)/g, (_match, gap: string, letter: string) => `${gap ? ' ' : ''}${letter.toUpperCase()}`);
}

function entriesFor(value: unknown): DropSourceEntry[] {
  const totals = new Map<number, number>();
  for (const entry of list(value)) {
    const chance = finite(entry.pct);
    const group = object(entry.group);
    const itemIds = Array.isArray(group.items)
      ? group.items.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0)
      : [];
    if (itemIds.length > 0) {
      const sourceCount = finite(group.sourceCount, finite(group.count, itemIds.length));
      const divisor = sourceCount > 0 ? sourceCount : itemIds.length;
      for (const itemId of itemIds) totals.set(itemId, (totals.get(itemId) ?? 0) + chance / divisor);
      continue;
    }
    const direct = object(entry.item);
    const directId = Number(direct.id ?? direct.key);
    if (Number.isSafeInteger(directId) && directId > 0) {
      totals.set(directId, (totals.get(directId) ?? 0) + chance);
    }
  }
  return [...totals.entries()].map(([itemId, itemChancePercent]) => Object.freeze({ itemId, itemChancePercent }));
}

export function createDropSources(
  stages: readonly StageRecord[],
  boxes: readonly StageBoxRecord[]
): readonly DropSource[] {
  const boxById = new Map(boxes.map((box) => [box.id, box]));
  const sources: DropSource[] = [];
  for (const stage of stages) {
    const root = object(stage.source.drops);
    const rates = new Map(stageDrops(stage).map((drop) => [drop.kind, drop.rate]));
    for (const kind of ['monster', 'boss'] as const) {
      const section = object(root[kind]);
      const box = object(section.box);
      const boxId = text(box.id);
      if (!boxId) continue;
      const table = object(section.table);
      const entries = entriesFor(table.entries);
      if (entries.length === 0) continue;
      const record = boxById.get(boxId);
      sources.push(Object.freeze({
        stageId: stage.id,
        stageName: stage.name,
        stageHref: `/stages/${stage.slug}`,
        difficulty: stage.difficulty,
        act: stage.act,
        boxId,
        boxName: text(box.name, record?.name ?? `${titleCase(kind)} box`),
        boxHref: record ? `/items/${record.slug}` : '/stage-boxes',
        boxRatePercent: rates.get(kind) ?? finite(table.pct ?? section.pct),
        entries: Object.freeze(entries)
      }));
    }
  }
  return Object.freeze(sources);
}

export function createFarmingStages(
  stages: readonly StageRecord[],
  sources: readonly DropSource[]
): readonly FarmingStageCandidate[] {
  const byStage = new Map<string, DropSource[]>();
  for (const source of sources) {
    const rows = byStage.get(source.stageId) ?? [];
    rows.push(source);
    byStage.set(source.stageId, rows);
  }
  return Object.freeze(stages.map((stage) => Object.freeze({
    stageId: stage.id,
    name: stage.name,
    href: `/stages/${stage.slug}`,
    difficulty: stage.difficulty,
    act: stage.act,
    goldPerClear: stage.goldPerClear,
    drops: Object.freeze((byStage.get(stage.id) ?? []).flatMap((source) =>
      source.entries.map((entry) => Object.freeze({
        itemId: entry.itemId,
        boxRatePercent: source.boxRatePercent,
        itemChancePercent: entry.itemChancePercent
      }))
    ))
  })));
}

function statMap(gear: GearRecord): Map<string, string | number> {
  return new Map(gear.stats.map((stat) => [stat.label, stat.value]));
}

function addStat(values: Record<BisStat, number>, statName: string, value: number) {
  const normalized = statName.toLowerCase();
  const target: BisStat = /(attack|damage|critical|speed)/.test(normalized)
    ? 'attack'
    : /(armor|hp|health|resist|block|dodge)/.test(normalized)
      ? 'defense'
      : 'utility';
  values[target] += Math.max(0, value);
}

export function createBisGear(
  gearRows: readonly GearRecord[],
  heroes: readonly HeroRecord[]
): readonly BisGearCandidate[] {
  return Object.freeze(gearRows.map((gear) => {
    const map = statMap(gear);
    const base1 = Math.max(0, finite(map.get('BaseStat1_Value')));
    const base2 = Math.max(0, finite(map.get('BaseStat2_Value')));
    const values: Record<BisStat, number> = { attack: 0, defense: 0, utility: 0 };
    if (gear.gearGroup === 'Weapon') {
      values.attack = base1 * 10 + base2;
      values.utility = gear.level / 10;
    } else if (gear.gearGroup === 'Off-hand') {
      values.attack = base1 * 3;
      values.defense = base1 * 5 + base2;
      values.utility = gear.level / 12;
    } else if (gear.gearGroup === 'Armor') {
      values.defense = base1 * 10 + base2;
      values.utility = gear.level / 15;
    } else {
      values.attack = base1 * 2;
      values.defense = base2;
      values.utility = base1 + base2 + gear.level / 8;
    }
    for (let index = 1; index <= 3; index += 1) {
      const statName = text(map.get(`InherentStat${index}_STATTYPE`));
      if (statName && statName !== 'NONE') addStat(values, statName, finite(map.get(`InherentStat${index}_Value`)));
    }
    const compatibleHeroIds = gear.gearGroup === 'Weapon' || gear.gearGroup === 'Off-hand'
      ? heroes.filter((hero) => {
          const key = gear.gearGroup === 'Weapon' ? 'MainWeaponGearType' : 'SubWeaponGearType';
          return hero.source[key] === gear.gearType;
        }).map((hero) => hero.slug)
      : [];
    const slot = gear.gearGroup === 'Weapon'
      ? 'Main weapon'
      : gear.gearGroup === 'Off-hand'
        ? 'Sub weapon'
        : titleCase(gear.gearType);
    return Object.freeze({
      gearId: Number(gear.id),
      name: gear.name,
      href: `/items/${gear.slug}`,
      slot,
      compatibleHeroIds: Object.freeze(compatibleHeroIds),
      stats: Object.freeze(values)
    });
  }));
}

export function createToolItems(
  records: readonly (GearRecord | MaterialRecord)[]
): readonly ToolItemOption[] {
  return Object.freeze(records.map((record) => Object.freeze({
    itemId: Number(record.id),
    name: record.name,
    href: `/items/${record.slug}`
  })).sort((left, right) => left.name.localeCompare(right.name) || left.itemId - right.itemId));
}

export function createToolHeroes(heroes: readonly HeroRecord[]): readonly ToolHeroOption[] {
  return Object.freeze(heroes.map((hero) => Object.freeze({ id: hero.slug, name: hero.name })));
}

export function createDamageStages(stages: readonly StageRecord[]): readonly ToolDamageStage[] {
  return Object.freeze(stages.map((stage) => {
    const actors = stageActors(stage);
    const hits = [...actors.monsters.map((monster) => monster.atk), actors.boss?.atk ?? 0];
    return Object.freeze({ id: stage.id, name: stage.name, enemyHit: Math.max(1, ...hits) });
  }));
}
