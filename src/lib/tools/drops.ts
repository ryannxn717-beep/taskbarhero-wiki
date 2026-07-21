export interface DropSourceEntry {
  itemId: number;
  itemChancePercent: number;
}

export interface DropSource {
  stageId: string;
  stageName: string;
  stageHref: string;
  difficulty: string;
  act: number;
  boxId: string;
  boxName: string;
  boxHref: string;
  boxRatePercent: number;
  entries: readonly DropSourceEntry[];
}

export interface DropFinderFilter {
  itemId: number;
  difficulty: 'all' | string;
  act: 'all' | number;
}

export interface DropFinderRow extends Omit<DropSource, 'entries'> {
  itemChancePercent: number;
  perClearChancePercent: number;
}

export interface DropFinderResult {
  itemId: number;
  rows: readonly DropFinderRow[];
  unavailable: boolean;
}

function percent(field: string, value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${field} must be a finite number from 0 to 100; received ${String(value)}`);
  }
}

function positiveInteger(field: string, value: number) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive integer; received ${String(value)}`);
  }
}

function rounded(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function findItemDrops(
  sources: readonly DropSource[],
  filter: DropFinderFilter
): DropFinderResult {
  positiveInteger('itemId', filter.itemId);
  if (filter.act !== 'all') positiveInteger('act', filter.act);
  const sourceKeys = new Set<string>();
  const rows: DropFinderRow[] = [];
  for (const source of sources) {
    positiveInteger(`stage ${source.stageId} act`, source.act);
    percent(`stage ${source.stageId} boxRatePercent`, source.boxRatePercent);
    const key = `${source.stageId}:${source.boxId}`;
    if (sourceKeys.has(key)) throw new Error(`duplicate drop source ${key}`);
    sourceKeys.add(key);
    for (const entry of source.entries) {
      positiveInteger(`${key} itemId`, entry.itemId);
      percent(`${key} itemChancePercent`, entry.itemChancePercent);
    }
    if (filter.difficulty !== 'all' && source.difficulty !== filter.difficulty) continue;
    if (filter.act !== 'all' && source.act !== filter.act) continue;
    const itemChancePercent = source.entries
      .filter((entry) => entry.itemId === filter.itemId)
      .reduce((sum, entry) => sum + entry.itemChancePercent, 0);
    if (itemChancePercent <= 0) continue;
    percent(`${key} combined itemChancePercent`, itemChancePercent);
    rows.push(Object.freeze({
      stageId: source.stageId,
      stageName: source.stageName,
      stageHref: source.stageHref,
      difficulty: source.difficulty,
      act: source.act,
      boxId: source.boxId,
      boxName: source.boxName,
      boxHref: source.boxHref,
      boxRatePercent: source.boxRatePercent,
      itemChancePercent: rounded(itemChancePercent),
      perClearChancePercent: rounded(source.boxRatePercent * itemChancePercent / 100)
    }));
  }
  rows.sort((left, right) =>
    right.perClearChancePercent - left.perClearChancePercent ||
    left.stageId.localeCompare(right.stageId) ||
    left.boxId.localeCompare(right.boxId)
  );
  return Object.freeze({ itemId: filter.itemId, rows: Object.freeze(rows), unavailable: rows.length === 0 });
}
