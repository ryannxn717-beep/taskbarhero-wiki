import type { GearFilter } from './repository.ts';
import type { GearGroup, GradeId } from './schema.ts';

export const GEAR_RARITY_OPTIONS: readonly { id: GradeId; label: string }[] = Object.freeze([
  { id: 'COMMON', label: 'Common' },
  { id: 'UNCOMMON', label: 'Uncommon' },
  { id: 'RARE', label: 'Rare' },
  { id: 'LEGENDARY', label: 'Legendary' },
  { id: 'IMMORTAL', label: 'Immortal' },
  { id: 'ARCANA', label: 'Arcana' },
  { id: 'BEYOND', label: 'Beyond' },
  { id: 'CELESTIAL', label: 'Celestial' },
  { id: 'DIVINE', label: 'Divine' },
  { id: 'COSMIC', label: 'Cosmic' }
]);

export const GEAR_GROUP_OPTIONS: readonly { id: GearGroup; label: string }[] = Object.freeze([
  { id: 'Weapon', label: 'Weapon' },
  { id: 'Off-hand', label: 'Off-hand' },
  { id: 'Armor', label: 'Armor' },
  { id: 'Accessory', label: 'Accessory' }
]);

export const GEAR_STAT_OPTIONS: readonly { id: string; label: string }[] = Object.freeze([
  { id: 'AttackDamage', label: 'Attack Damage' },
  { id: 'CriticalDamage', label: 'Critical Damage' },
  { id: 'CooldownReduction', label: 'Cooldown Reduction' },
  { id: 'AttackSpeed', label: 'Attack Speed' },
  { id: 'CriticalChance', label: 'Critical Chance' },
  { id: 'MaxHp', label: 'Max HP' },
  { id: 'Armor', label: 'Armor' },
  { id: 'HpRegenPerSec', label: 'HP Regen Per Sec' },
  { id: 'AreaOfEffect', label: 'Area of Effect' },
  { id: 'MovementSpeed', label: 'Movement Speed' },
  { id: 'BlockChance', label: 'Block Chance' },
  { id: 'CastSpeed', label: 'Cast Speed' },
  { id: 'AddHpPerHit', label: 'HP Per Hit' },
  { id: 'DamageReduction', label: 'Damage Reduction' },
  { id: 'SkillDurationIncrease', label: 'Skill Duration Increase' },
  { id: 'DamageAbsorption', label: 'Damage Absorption' },
  { id: 'HpLeech', label: 'Life Leech' },
  { id: 'AllElementalResistance', label: 'All Elemental Resistance' },
  { id: 'SkillHealIncrease', label: 'Skill Heal Increase' },
  { id: 'AddHpPerKill', label: 'Add Hp Per Kill' },
  { id: 'IncreaseExpAmount', label: 'Increase Exp Amount' },
  { id: 'DodgeChance', label: 'Dodge Chance' },
  { id: 'SkillRangeExpansion', label: 'Skill Range' },
  { id: 'BasicAttackRequirementReduction', label: 'Basic Attack Requirement Reduction' },
  { id: 'AddAllSkillLevel', label: 'Add All Skill Level' },
  { id: 'IncreaseProjectileDamage', label: 'Increase Projectile Damage' },
  { id: 'ProjectileCount', label: 'Projectile Count' },
  { id: 'Multistrike', label: 'Multistrike' }
]);

export const SOURCE_GEAR_UI_DEFAULT: GearFilter = {
  query: '',
  gradeIds: [],
  gearTypes: [],
  gearGroups: [],
  statTypes: [],
  minLevel: 1,
  maxLevel: 55,
  obtainable: 'yes',
  sort: 'name-asc'
};

function supported<T extends string>(values: string[], options: readonly { id: T }[]): T[] {
  const allowed = new Set(options.map((option) => option.id));
  return values.filter((value): value is T => allowed.has(value as T));
}

export function parseGearQuery(query: string): GearFilter {
  const params = new URLSearchParams(query);
  const numberOr = (name: string, fallback: number): number => {
    const raw = params.get(name);
    if (raw === null || raw.trim() === '') return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? Math.min(55, Math.max(1, value)) : fallback;
  };
  const statIds = new Set(GEAR_STAT_OPTIONS.map((option) => option.id));
  const sort = params.get('sort');
  const obtainable = params.get('obtainable');
  return {
    query: params.get('q') ?? '',
    gradeIds: supported((params.get('rarity') ?? '').split(',').filter(Boolean), GEAR_RARITY_OPTIONS),
    gearTypes: [],
    gearGroups: supported((params.get('type') ?? '').split(',').filter(Boolean), GEAR_GROUP_OPTIONS),
    statTypes: (params.get('stat') ?? '').split(',').filter((value) => statIds.has(value)),
    minLevel: numberOr('min', 1),
    maxLevel: numberOr('max', 55),
    obtainable: obtainable === 'all' || obtainable === 'no' ? obtainable : 'yes',
    sort: sort === 'name-desc' || sort === 'level-asc' || sort === 'level-desc' ||
      sort === 'grade-asc' || sort === 'grade-desc' ? sort : 'name-asc'
  };
}

export function gearQuery(filter: GearFilter): string {
  const params = new URLSearchParams();
  if (filter.query) params.set('q', filter.query);
  if (filter.gradeIds.length) params.set('rarity', filter.gradeIds.join(','));
  if (filter.gearGroups.length) params.set('type', filter.gearGroups.join(','));
  if (filter.statTypes.length) params.set('stat', filter.statTypes.join(','));
  if (filter.minLevel !== 1) params.set('min', String(filter.minLevel));
  if (filter.maxLevel !== 55) params.set('max', String(filter.maxLevel));
  if (filter.obtainable !== 'yes') params.set('obtainable', filter.obtainable);
  if (filter.sort !== 'name-asc') params.set('sort', filter.sort);
  return params.toString();
}
