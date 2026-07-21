import { cubeLevelMilestones, gradeGoldAndExp, type CubeGrade } from '$lib/cube/data';

export interface CubeLevelingInput {
  currentLevel: number;
  currentExp: number;
  targetLevel: number;
  itemGrade: CubeGrade;
}

export interface CubeLevelingResult {
  currentTotalExp: number;
  targetTotalExp: number;
  requiredExp: number;
  itemGrade: CubeGrade;
  itemExp: number;
  itemCount: number;
  expOverage: number;
  opportunityGold: number;
  tierPath: readonly { level: number; totalExp: number; expFromPrevious: number }[];
}

function level(field: 'currentLevel' | 'targetLevel', value: number) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new Error(`${field} must be an integer from 1 to 100; received ${String(value)}`);
  }
}

export function cubeExpAtLevel(value: number): number {
  level('targetLevel', value);
  const exact = cubeLevelMilestones.find((row) => row.level === value);
  if (exact) return exact.totalExp;
  const upperIndex = cubeLevelMilestones.findIndex((row) => row.level > value);
  if (upperIndex <= 0) throw new Error(`targetLevel ${value} is outside the milestone curve`);
  const lower = cubeLevelMilestones[upperIndex - 1];
  const upper = cubeLevelMilestones[upperIndex];
  const progress = (value - lower.level) / (upper.level - lower.level);
  return Math.round(lower.totalExp + (upper.totalExp - lower.totalExp) * progress);
}

export function planCubeLeveling(input: CubeLevelingInput): CubeLevelingResult {
  level('currentLevel', input.currentLevel);
  level('targetLevel', input.targetLevel);
  if (input.targetLevel <= input.currentLevel) {
    throw new Error(`targetLevel ${input.targetLevel} must be greater than currentLevel ${input.currentLevel}`);
  }
  if (!Number.isSafeInteger(input.currentExp) || input.currentExp < 0) {
    throw new Error(`currentExp must be a nonnegative safe integer; received ${String(input.currentExp)}`);
  }
  const currentTotalExp = cubeExpAtLevel(input.currentLevel);
  if (input.currentExp < currentTotalExp) {
    throw new Error(`currentExp must be at least ${currentTotalExp} for currentLevel ${input.currentLevel}; received ${input.currentExp}`);
  }
  const targetTotalExp = cubeExpAtLevel(input.targetLevel);
  if (input.currentExp >= targetTotalExp) {
    throw new Error(`currentExp ${input.currentExp} already reaches targetLevel ${input.targetLevel}`);
  }
  const item = gradeGoldAndExp.find((row) => row.grade === input.itemGrade);
  if (!item) throw new Error(`itemGrade must be a supported Cube grade; received ${String(input.itemGrade)}`);
  const requiredExp = targetTotalExp - input.currentExp;
  const itemCount = Math.ceil(requiredExp / item.exp);
  const expOverage = itemCount * item.exp - requiredExp;
  const pathLevels = cubeLevelMilestones
    .filter((row) => row.level > input.currentLevel && row.level <= input.targetLevel)
    .map((row) => row.level);
  if (!pathLevels.includes(input.targetLevel)) pathLevels.push(input.targetLevel);
  pathLevels.sort((left, right) => left - right);
  let previous = input.currentExp;
  const tierPath = Object.freeze(pathLevels.map((pathLevel) => {
    const totalExp = cubeExpAtLevel(pathLevel);
    const row = Object.freeze({ level: pathLevel, totalExp, expFromPrevious: totalExp - previous });
    previous = totalExp;
    return row;
  }));
  return Object.freeze({
    currentTotalExp,
    targetTotalExp,
    requiredExp,
    itemGrade: item.grade,
    itemExp: item.exp,
    itemCount,
    expOverage,
    opportunityGold: itemCount * item.gold,
    tierPath
  });
}
