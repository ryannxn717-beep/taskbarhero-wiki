import type { GearRecord, StageBoxRecord } from './schema';

export const DROP_SCENARIOS = ['base', 'hunter', 'slayer', 'both'] as const;
export type DropScenario = (typeof DROP_SCENARIOS)[number];

export interface ItemDropStage {
  key: number;
  label: string;
  percent: number;
}

export interface ItemDropCard {
  box: StageBoxRecord;
  chances: Record<DropScenario, number>;
  stages: ItemDropStage[];
  via: 'monster' | 'boss' | 'drop';
}

export interface ItemStatusLine {
  label: string;
  qualifier: string;
  value: string;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asFiniteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const asRecords = (value: unknown): UnknownRecord[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const titleCase = (value: string): string =>
  value.toLowerCase().replace(/(^|[_\s-]+)([a-z])/g, (_match, gap: string, letter: string) => `${gap ? ' ' : ''}${letter.toUpperCase()}`);

function entryContainsGear(entry: UnknownRecord, gearId: number): { divisor: number } | null {
  const item = isRecord(entry.item) ? entry.item : null;
  if (asFiniteNumber(item?.id) === gearId) return { divisor: 1 };

  const group = isRecord(entry.group) ? entry.group : null;
  const items = Array.isArray(group?.items) ? group.items : [];
  if (!items.some((id) => Number(id) === gearId)) return null;
  const sourceCount = asFiniteNumber(group?.sourceCount) ?? asFiniteNumber(group?.count) ?? items.length;
  if (sourceCount <= 0) throw new Error(`stage box group containing gear ${gearId} has invalid source count ${sourceCount}`);
  return { divisor: sourceCount };
}

function scenarioChances(entry: UnknownRecord, divisor: number, context: string): Record<DropScenario, number> {
  const pcts = isRecord(entry.pcts) ? entry.pcts : null;
  const fallback = asFiniteNumber(entry.pct);
  const chance = (scenario: DropScenario): number => {
    const value = asFiniteNumber(pcts?.[scenario]) ?? fallback;
    if (value === null || value < 0) throw new Error(`${context} has no valid ${scenario} probability`);
    return value / divisor;
  };
  return { base: chance('base'), hunter: chance('hunter'), slayer: chance('slayer'), both: chance('both') };
}

function stagesFor(drop: UnknownRecord): ItemDropStage[] {
  return asRecords(drop.stages).map((stage, index) => {
    const key = asFiniteNumber(stage.key);
    const act = asFiniteNumber(stage.act);
    const number = asFiniteNumber(stage.no);
    const rate = asFiniteNumber(stage.rate);
    const difficulty = typeof stage.difficulty === 'string' ? stage.difficulty : 'UNKNOWN';
    if (key === null || act === null || number === null || rate === null) {
      throw new Error(`stage box stage[${index}] has incomplete stage metadata`);
    }
    return {
      key,
      label: `A${act}-${number} ${titleCase(difficulty)}`,
      percent: rate / 10
    };
  });
}

export function itemDropCards(gear: GearRecord, boxes: readonly StageBoxRecord[]): ItemDropCard[] {
  const gearId = Number(gear.id);
  if (!Number.isInteger(gearId)) throw new Error(`gear id must be numeric: ${gear.id}`);

  return boxes.flatMap((box) => {
    const table = isRecord(box.drop.table) ? box.drop.table : null;
    const entries = asRecords(table?.entries);
    const match = entries.map((entry) => ({ entry, match: entryContainsGear(entry, gearId) }))
      .find((candidate) => candidate.match !== null);
    if (!match?.match) return [];
    const stages = stagesFor(box.drop);
    const viaValue = asRecords(box.drop.stages)[0]?.via;
    const via = viaValue === 'monster' || viaValue === 'boss' ? viaValue : 'drop';
    return [{
      box,
      chances: scenarioChances(match.entry, match.match.divisor, `stage box ${box.id}`),
      stages,
      via
    }];
  });
}

const TWO_STAT_GEAR = new Set(['SWORD', 'BOW', 'STAFF', 'SCEPTER', 'CROSSBOW', 'AXE']);

export function itemStatusLines(gear: GearRecord): ItemStatusLine[] {
  const detail = isRecord(gear.source.detail) ? gear.source.detail : null;
  const stats = isRecord(detail?.stats) ? detail.stats : null;
  const first = asFiniteNumber(stats?.BaseStat1_Value);
  const second = asFiniteNumber(stats?.BaseStat2_Value);
  const lines: ItemStatusLine[] = [];

  if (first !== null) {
    lines.push({
      label: TWO_STAT_GEAR.has(gear.gearType) ? 'Attack Damage' : 'Base Status',
      qualifier: 'Base',
      value: `${first >= 0 ? '+' : ''}${first}`
    });
  }
  if (second !== null && TWO_STAT_GEAR.has(gear.gearType)) {
    lines.push({
      label: 'Attack Speed',
      qualifier: 'Base',
      value: `${second >= 0 ? '+' : ''}${(second / 100).toFixed(2)}/s`
    });
  }
  return lines;
}
