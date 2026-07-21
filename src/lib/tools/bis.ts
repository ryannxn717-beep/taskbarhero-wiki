export type BisStat = 'attack' | 'defense' | 'utility';

export interface BisWeights {
  attack: number;
  defense: number;
  utility: number;
}

export interface BisGearCandidate {
  gearId: number;
  name: string;
  href: string;
  slot: string;
  compatibleHeroIds: readonly string[];
  stats: Readonly<BisWeights>;
}

export interface BisInput {
  heroId: string;
  weights: BisWeights;
}

export interface BisContribution {
  stat: BisStat;
  raw: number;
  weight: number;
  score: number;
}

export interface BisResultRow extends BisGearCandidate {
  score: number;
  contributions: readonly BisContribution[];
}

export interface BisResult {
  heroId: string;
  normalizedWeights: Readonly<BisWeights>;
  rows: readonly BisResultRow[];
  bestBySlot: readonly BisResultRow[];
}

const stats: readonly BisStat[] = ['attack', 'defense', 'utility'];

function rounded(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function validateWeight(stat: BisStat, value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1000) {
    throw new Error(`${stat} weight must be a finite number from 0 to 1000; received ${String(value)}`);
  }
}

export function scoreBestInSlot(
  candidates: readonly BisGearCandidate[],
  input: BisInput
): BisResult {
  if (!input.heroId.trim()) throw new Error('heroId must not be empty');
  for (const stat of stats) validateWeight(stat, input.weights[stat]);
  const weightTotal = stats.reduce((sum, stat) => sum + input.weights[stat], 0);
  if (weightTotal <= 0) throw new Error('at least one weight must be greater than zero');
  const normalizedWeights = Object.freeze(Object.fromEntries(
    stats.map((stat) => [stat, rounded(input.weights[stat] / weightTotal)])
  ) as unknown as BisWeights);

  const seen = new Set<number>();
  const rows: BisResultRow[] = [];
  for (const candidate of candidates) {
    if (!Number.isSafeInteger(candidate.gearId) || candidate.gearId < 1) {
      throw new Error(`gear id must be a positive safe integer; received ${String(candidate.gearId)}`);
    }
    if (seen.has(candidate.gearId)) throw new Error(`duplicate gear id ${candidate.gearId}`);
    seen.add(candidate.gearId);
    for (const stat of stats) {
      const value = candidate.stats[stat];
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`gear ${candidate.gearId} ${stat} must be a nonnegative finite number; received ${String(value)}`);
      }
    }
    if (candidate.compatibleHeroIds.length > 0 && !candidate.compatibleHeroIds.includes(input.heroId)) continue;
    const contributions = Object.freeze(stats.map((stat) => Object.freeze({
      stat,
      raw: candidate.stats[stat],
      weight: normalizedWeights[stat],
      score: rounded(candidate.stats[stat] * normalizedWeights[stat])
    })));
    const score = rounded(contributions.reduce((sum, entry) => sum + entry.score, 0));
    rows.push(Object.freeze({ ...candidate, score, contributions }));
  }
  rows.sort((left, right) => right.score - left.score || left.name.localeCompare(right.name) || left.gearId - right.gearId);

  const bestBySlot = new Map<string, BisResultRow>();
  for (const row of rows) if (!bestBySlot.has(row.slot)) bestBySlot.set(row.slot, row);
  const slotRows = [...bestBySlot.values()].sort((left, right) => left.slot.localeCompare(right.slot));
  return Object.freeze({
    heroId: input.heroId,
    normalizedWeights,
    rows: Object.freeze(rows),
    bestBySlot: Object.freeze(slotRows)
  });
}
