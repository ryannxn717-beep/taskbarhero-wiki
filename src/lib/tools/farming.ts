export interface FarmingDropChance {
  itemId: number;
  boxRatePercent: number;
  itemChancePercent: number;
}

export interface FarmingStageCandidate {
  stageId: string;
  name: string;
  href: string;
  difficulty: string;
  act: number;
  goldPerClear: number;
  drops: readonly FarmingDropChance[];
}

export interface FarmingInput {
  targetItemId: number;
  secondsPerClear: number;
}

export interface FarmingResultRow extends Omit<FarmingStageCandidate, 'drops'> {
  expectedPerClear: number;
  expectedPerMinute: number;
  clearsPerExpected: number;
  goldPerMinute: number;
}

export interface FarmingResult {
  targetItemId: number;
  secondsPerClear: number;
  rows: readonly FarmingResultRow[];
  unavailable: boolean;
}

function finiteRange(field: string, value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${field} must be a finite number from ${minimum} to ${maximum}; received ${String(value)}`);
  }
}

function positiveInteger(field: string, value: number) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive safe integer; received ${String(value)}`);
  }
}

function rounded(value: number): number {
  return Math.round(value * 100_000_000) / 100_000_000;
}

export function rankFarmingStages(
  stages: readonly FarmingStageCandidate[],
  input: FarmingInput
): FarmingResult {
  positiveInteger('targetItemId', input.targetItemId);
  finiteRange('secondsPerClear', input.secondsPerClear, 1, 3600);
  const stageIds = new Set<string>();
  const rows: FarmingResultRow[] = [];

  for (const stage of stages) {
    if (!stage.stageId) throw new Error('stageId must not be empty');
    if (stageIds.has(stage.stageId)) throw new Error(`duplicate stage id ${stage.stageId}`);
    stageIds.add(stage.stageId);
    if (!Number.isSafeInteger(stage.act) || stage.act < 1) {
      throw new Error(`stage ${stage.stageId} act must be a positive integer; received ${String(stage.act)}`);
    }
    finiteRange(`stage ${stage.stageId} goldPerClear`, stage.goldPerClear, 0, Number.MAX_SAFE_INTEGER);
    let expectedPerClear = 0;
    for (const drop of stage.drops) {
      positiveInteger(`stage ${stage.stageId} itemId`, drop.itemId);
      finiteRange(`stage ${stage.stageId} boxRatePercent`, drop.boxRatePercent, 0, 100);
      finiteRange(`stage ${stage.stageId} itemChancePercent`, drop.itemChancePercent, 0, 100);
      if (drop.itemId === input.targetItemId) {
        expectedPerClear += (drop.boxRatePercent / 100) * (drop.itemChancePercent / 100);
      }
    }
    if (expectedPerClear <= 0) continue;
    const clearsPerMinute = 60 / input.secondsPerClear;
    expectedPerClear = rounded(expectedPerClear);
    rows.push(Object.freeze({
      stageId: stage.stageId,
      name: stage.name,
      href: stage.href,
      difficulty: stage.difficulty,
      act: stage.act,
      goldPerClear: stage.goldPerClear,
      expectedPerClear,
      expectedPerMinute: rounded(expectedPerClear * clearsPerMinute),
      clearsPerExpected: rounded(1 / expectedPerClear),
      goldPerMinute: rounded(stage.goldPerClear * clearsPerMinute)
    }));
  }

  rows.sort((left, right) =>
    right.expectedPerMinute - left.expectedPerMinute ||
    right.goldPerMinute - left.goldPerMinute ||
    left.stageId.localeCompare(right.stageId)
  );
  return Object.freeze({
    targetItemId: input.targetItemId,
    secondsPerClear: input.secondsPerClear,
    rows: Object.freeze(rows),
    unavailable: rows.length === 0
  });
}
