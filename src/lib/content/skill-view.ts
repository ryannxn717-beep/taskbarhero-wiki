import type { HeroRecord, PassiveSkillRecord, SkillRecord } from './schema';

export type SkillEntry = SkillRecord | PassiveSkillRecord;

const PASSIVE_ICON_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  ElementalDodgeChance: 'DodgeChance',
  IncreaseAreaOfEffectDamage: 'AreaOfEffectDamage',
  IncreaseProjectileDamage: 'ProjectileDamage',
  SkillDurationIncrease: 'Duration',
  SkillHealIncrease: 'SkillHealAmount'
});

const DIVIDED_PERCENT_STATS = new Set([
  'CooldownReduction', 'CriticalChance', 'CriticalDamage', 'DodgeChance', 'BlockChance',
  'ElementalBlockChance', 'ElementalDodgeChance', 'HpLeech', 'IncreaseExpAmount',
  'IncreaseGoldAmount', 'SkillRangeExpansion', 'DamageReduction', 'PhysicalDamageReduction',
  'FireDamageReduction', 'ColdDamageReduction', 'LightningDamageReduction',
  'ChaosDamageReduction', 'SkillHealIncrease', 'SkillDurationIncrease', 'IncreaseMeleeDamage',
  'IncreaseProjectileDamage', 'IncreaseAreaOfEffectDamage', 'IncreaseSummonDamage',
  'IncreaseProjectileSpeed'
]);

function recordValue(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function finiteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function skillTitleCase(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '—';
  return value
    .trim()
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function isNamedActiveSkill(skill: SkillEntry): boolean {
  return skill.kind === 'skill' && !/^Skill\s+\d+$/i.test(skill.name.trim());
}

export function skillDisplayName(skill: SkillEntry): string {
  return /^Skill\s+\d+$/i.test(skill.name.trim()) ? `#${skill.id}` : skill.name;
}

export function skillIcon(skill: SkillEntry): string | null {
  if (skill.kind === 'passiveSkill') {
    const stat = String(skill.source.STATTYPE ?? skill.stats[0]?.label ?? '');
    return stat ? `/game/skills/Passive_${PASSIVE_ICON_ALIASES[stat] ?? stat}.png` : null;
  }
  return isNamedActiveSkill(skill) ? `/game/skills/Skill_${skill.id}.png` : null;
}

export function skillStatLabel(value: unknown): string {
  if (typeof value !== 'string' || !value) return '—';
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\b(Dlc|Hp|Aoe)\b/g, (word) => word.toUpperCase());
}

export function formatPassiveSkillValue(skill: PassiveSkillRecord, multiplier = 1): string {
  const stat = String(skill.source.STATTYPE ?? skill.stats[0]?.label ?? '');
  const modifier = String(skill.source.MODTYPE ?? '');
  const raw = finiteNumber(skill.source.Value ?? skill.stats[0]?.value);
  if (raw === null) return '—';
  const value = raw * multiplier;
  if (stat === 'AttackSpeed' && (modifier === 'FLAT' || !modifier)) {
    return `+${(value / 100).toFixed(2)}/s`;
  }
  const percentage = stat.endsWith('Percent')
    || modifier === 'ADDITIVE'
    || modifier === 'MULTIPLICATIVE'
    || DIVIDED_PERCENT_STATS.has(stat);
  const display = percentage ? value / 10 : value;
  return `+${display.toLocaleString('en-US', { maximumFractionDigits: 1 })}${percentage ? '%' : ''}`;
}

export function skillHeroes(skill: SkillEntry, heroes: readonly HeroRecord[]): HeroRecord[] {
  const ids = new Set(skill.heroIds);
  return heroes.filter((hero) => ids.has(hero.id));
}

export function skillAttributeMaxLevel(skill: SkillEntry, heroes: readonly HeroRecord[]): number {
  const numericId = Number(skill.id);
  for (const hero of skillHeroes(skill, heroes)) {
    for (const rawAttribute of hero.attributes) {
      const attribute = recordValue(rawAttribute);
      if (!attribute) continue;
      const matches = skill.kind === 'skill'
        ? finiteNumber(recordValue(attribute.activeSkill)?.key) === numericId
        : finiteNumber(attribute.key) === numericId;
      const maxLevel = finiteNumber(attribute.maxLevel);
      if (matches && maxLevel !== null) return maxLevel;
    }
  }
  return skill.kind === 'skill' ? skill.maxLevel : 0;
}

export function skillAttributePointCost(skill: SkillEntry, heroes: readonly HeroRecord[]): number {
  const numericId = Number(skill.id);
  for (const hero of skillHeroes(skill, heroes)) {
    for (const rawAttribute of hero.attributes) {
      const attribute = recordValue(rawAttribute);
      if (!attribute) continue;
      const matches = skill.kind === 'skill'
        ? finiteNumber(recordValue(attribute.activeSkill)?.key) === numericId
        : finiteNumber(attribute.key) === numericId;
      const required = finiteNumber(attribute.required);
      if (matches && required !== null) return required;
    }
  }
  return 1;
}

export function skillActivationLabel(skill: SkillEntry): string {
  if (skill.kind === 'passiveSkill') return 'Passive';
  return skillTitleCase(skill.source.ACTIVATIONTYPE ?? skill.activation);
}

export interface SkillFact {
  label: string;
  value: string;
}

export function skillDetailFacts(skill: SkillEntry, heroes: readonly HeroRecord[]): SkillFact[] {
  if (skill.kind === 'passiveSkill') {
    const maxLevel = skillAttributeMaxLevel(skill, heroes);
    const pointCost = skillAttributePointCost(skill, heroes);
    return [
      { label: 'Stat', value: skillStatLabel(skill.source.STATTYPE ?? skill.stats[0]?.label) },
      { label: 'Modifier', value: skillTitleCase(skill.source.MODTYPE) },
      { label: 'Per level', value: formatPassiveSkillValue(skill) },
      { label: 'Max Lv', value: String(maxLevel) },
      { label: 'At max', value: formatPassiveSkillValue(skill, maxLevel) },
      { label: 'Point cost', value: `${pointCost} pt${pointCost === 1 ? '' : 's'}` }
    ];
  }

  const rawPower = finiteNumber(skill.source.Value);
  return [
    { label: 'Activation', value: skillActivationLabel(skill) },
    { label: 'Slot', value: skillTitleCase(skill.source.SLOTTYPE) },
    { label: 'Element', value: skillTitleCase(skill.source.DamageType ?? skill.element) },
    { label: 'Delivery', value: skillTitleCase(skill.source.DamageDeliveryType) },
    { label: 'Range', value: String(skill.source.Range ?? skill.range) },
    { label: 'Power', value: rawPower === null ? '—' : `${rawPower / 10}%` }
  ];
}
