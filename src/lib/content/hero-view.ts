import type { HeroRecord } from './schema';

export interface HeroStatusDisplay {
  key: string;
  name: string;
  value: string;
  best: boolean;
  rankPercent: number | null;
  tone: 'damage' | 'critical' | 'defense' | 'utility';
}

const ROLE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  Knight: 'Tank',
  Ranger: 'Ranger',
  Sorcerer: 'Mage',
  Priest: 'Support',
  Hunter: 'Hunter',
  Slayer: 'Slayer'
});

const STATUS_DEFINITIONS = [
  { key: 'AttackDamage', name: 'Attack Damage', tone: 'damage', format: (value: number) => String(value) },
  { key: 'AttackSpeed', name: 'Attack Speed', tone: 'damage', format: (value: number) => `${(value / 100).toFixed(2)}/s` },
  { key: 'CriticalChance', name: 'Crit Chance', tone: 'critical', format: (value: number) => `${(value / 10).toFixed(1)}%` },
  { key: 'CriticalDamage', name: 'Crit Damage', tone: 'critical', format: (value: number) => `${(value / 10).toFixed(0)}%` },
  { key: 'MaxHp', name: 'Max HP', tone: 'defense', format: (value: number) => String(value) },
  { key: 'Armor', name: 'Armor', tone: 'defense', format: (value: number) => String(value) },
  { key: 'MovementSpeed', name: 'Move Speed', tone: 'utility', format: (value: number) => String(value) },
  { key: 'CastSpeed', name: 'Cast Speed', tone: 'utility', format: (value: number) => `${(value / 100).toFixed(2)}×` },
  { key: 'CooldownReduction', name: 'Cooldown Red.', tone: 'utility', format: (value: number) => `${(value / 10).toFixed(0)}%` }
] as const;

export function heroArt(hero: HeroRecord): string {
  return `/game/content/heroes/full/${hero.slug}.png`;
}

export function heroStat(hero: HeroRecord, key: string): number {
  const line = hero.stats.find((stat) => stat.label === key);
  const value = Number(line?.value);
  if (!Number.isFinite(value)) throw new Error(`hero ${hero.id} has no finite ${key} stat`);
  return value;
}

export function heroRoleLabel(hero: HeroRecord): string {
  return ROLE_LABELS[hero.role] ?? hero.role;
}

export function heroWeapon(hero: HeroRecord, key: 'MainWeaponGearType' | 'SubWeaponGearType'): string {
  const value = hero.source[key];
  if (typeof value !== 'string' || !value) throw new Error(`hero ${hero.id} has no ${key}`);
  return value.toLowerCase().replace(/(^|_)([a-z])/g, (_match, gap: string, letter: string) => `${gap ? ' ' : ''}${letter.toUpperCase()}`);
}

export function heroUnlockLabel(hero: HeroRecord): string {
  if (hero.source.IsFirstAvailable === true) return 'Starter hero';
  const cost = Number(hero.source.UnlockCost);
  return Number.isFinite(cost) ? `${cost} Gold` : 'Unlock in game';
}

export function heroDps(hero: HeroRecord): string {
  const attackDamage = heroStat(hero, 'AttackDamage');
  const attackSpeed = heroStat(hero, 'AttackSpeed') / 100;
  const criticalChance = heroStat(hero, 'CriticalChance') / 1000;
  const criticalMultiplier = heroStat(hero, 'CriticalDamage') / 1000;
  return (attackDamage * attackSpeed * (1 + criticalChance * (criticalMultiplier - 1))).toFixed(2);
}

export function heroStatusDisplay(hero: HeroRecord, heroes: readonly HeroRecord[]): HeroStatusDisplay[] {
  return STATUS_DEFINITIONS.map((definition) => {
    const value = heroStat(hero, definition.key);
    const values = heroes.map((entry) => heroStat(entry, definition.key));
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const hasRanking = maximum > minimum;
    return {
      key: definition.key,
      name: definition.name,
      value: definition.format(value),
      best: hasRanking && value === maximum,
      rankPercent: hasRanking ? Math.round(8 + (92 * (value - minimum)) / (maximum - minimum)) : null,
      tone: definition.tone
    };
  });
}
