export interface DamageInput {
  attack: number;
  multiplierPercent: number;
  criticalChancePercent: number;
  criticalDamagePercent: number;
  defense: number;
  resistancePercent: number;
  mitigationPercent: number;
  hitCount: number;
}

export interface DamageResult {
  rawPerHit: number;
  defenseFactor: number;
  resistanceFactor: number;
  mitigationFactor: number;
  nonCriticalPerHit: number;
  criticalPerHit: number;
  expectedPerHit: number;
  expectedTotal: number;
}

export class DamageValidationError extends Error {
  constructor(public readonly field: keyof DamageInput, value: number, range: string) {
    super(`${field} must be ${range}; received ${String(value)}`);
    this.name = 'DamageValidationError';
  }
}

function range(field: keyof DamageInput, value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new DamageValidationError(field, value, `a finite number from ${minimum} to ${maximum}`);
  }
}

function rounded(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function calculateDamage(input: DamageInput): DamageResult {
  range('attack', input.attack, 0, 1_000_000_000);
  range('multiplierPercent', input.multiplierPercent, 0, 100_000);
  range('criticalChancePercent', input.criticalChancePercent, 0, 100);
  range('criticalDamagePercent', input.criticalDamagePercent, 100, 10_000);
  range('defense', input.defense, 0, 1_000_000_000);
  range('resistancePercent', input.resistancePercent, 0, 100);
  range('mitigationPercent', input.mitigationPercent, 0, 100);
  range('hitCount', input.hitCount, 1, 10_000);
  if (!Number.isSafeInteger(input.hitCount)) {
    throw new DamageValidationError('hitCount', input.hitCount, 'an integer from 1 to 10000');
  }

  const rawPerHit = input.attack * (input.multiplierPercent / 100);
  const defenseFactor = 100 / (100 + input.defense);
  const resistanceFactor = 1 - input.resistancePercent / 100;
  const mitigationFactor = 1 - input.mitigationPercent / 100;
  const nonCriticalPerHit = Math.max(0, rawPerHit * defenseFactor * resistanceFactor * mitigationFactor);
  const criticalPerHit = nonCriticalPerHit * (input.criticalDamagePercent / 100);
  const expectedPerHit = nonCriticalPerHit +
    (criticalPerHit - nonCriticalPerHit) * (input.criticalChancePercent / 100);
  return Object.freeze({
    rawPerHit: rounded(rawPerHit),
    defenseFactor: rounded(defenseFactor),
    resistanceFactor: rounded(resistanceFactor),
    mitigationFactor: rounded(mitigationFactor),
    nonCriticalPerHit: rounded(nonCriticalPerHit),
    criticalPerHit: rounded(criticalPerHit),
    expectedPerHit: rounded(expectedPerHit),
    expectedTotal: rounded(expectedPerHit * input.hitCount)
  });
}
