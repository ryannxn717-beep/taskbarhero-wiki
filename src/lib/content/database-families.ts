import type { GradeRecord, MaterialRecord, MonsterRecord } from './schema';

export interface MaterialEffect {
  stat: string;
  mod: string;
  min: number;
  max: number;
  tier: number | [number, number];
  chance: number | null;
}

export interface MonsterAnimation {
  name: string;
  label: string;
  sheet: string;
  frames: number;
  w: number;
  h: number;
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function sourceNumber(record: { source: Record<string, unknown> }, key: string): number {
  const value = Number(record.source[key]);
  return Number.isFinite(value) ? value : 0;
}

export function gradePropertyRow(grade: GradeRecord) {
  return {
    inherent: sourceNumber(grade, 'InherentSlotAmount'),
    decoration: sourceNumber(grade, 'ExtraSlotAmount_Decoration'),
    engraving: sourceNumber(grade, 'ExtraSlotAmount_Engraving'),
    inscription: sourceNumber(grade, 'ExtraSlotAmount_Inscription'),
    gold: sourceNumber(grade, 'BaseAlchemyGold'),
    cubeExp: sourceNumber(grade, 'BaseCubeExp')
  };
}

function isEffect(value: unknown): value is MaterialEffect {
  if (!value || typeof value !== 'object') return false;
  const effect = value as Record<string, unknown>;
  const tier = effect.tier;
  const validTier = Number.isFinite(Number(tier))
    || (Array.isArray(tier) && tier.length === 2 && tier.every((entry) => Number.isFinite(Number(entry))));
  return typeof effect.stat === 'string'
    && Number.isFinite(Number(effect.min))
    && Number.isFinite(Number(effect.max))
    && validTier;
}

export function materialEffectGroups(material: MaterialRecord): Array<{ slot: string; effects: MaterialEffect[] }> {
  const equipmentSlots = new Set(['WEAPON', 'ARMOR', 'ACCESSORY']);
  const allSlotKeys = new Set(['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY', 'IMMORTAL', 'ARCANA', 'BEYOND', 'CELESTIAL', 'DIVINE', 'COSMIC']);
  const grouped = new Map<string, MaterialEffect[]>();
  for (const [sourceSlot, value] of Object.entries(material.effectGroups)) {
    const slot = equipmentSlots.has(sourceSlot) ? sourceSlot : allSlotKeys.has(sourceSlot) ? 'ALL' : null;
    if (!slot || !Array.isArray(value)) continue;
    const effects = value.filter(isEffect).map((effect) => ({
        stat: effect.stat,
        mod: typeof effect.mod === 'string' ? effect.mod : 'FLAT',
        min: Number(effect.min),
        max: Number(effect.max),
        tier: Array.isArray(effect.tier)
          ? [Number(effect.tier[0]), Number(effect.tier[1])] as [number, number]
          : Number(effect.tier),
        chance: Number.isFinite(Number(effect.chance)) ? Number(effect.chance) : null
      }));
    grouped.set(slot, [...(grouped.get(slot) ?? []), ...effects]);
  }
  return [...grouped.entries()]
    .map(([slot, effects]) => ({ slot, effects }))
    .filter((group) => group.effects.length > 0);
}

export function statLabel(stat: string): string {
  return stat
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\bHp\b/g, 'HP')
    .replace(/\bExp\b/g, 'EXP');
}

const compactNumber = (value: number): string => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));

export function effectRange(effect: MaterialEffect): string {
  const additive = effect.mod === 'ADDITIVE';
  const percent = additive || /(Percent|Resistance|Chance|Speed)$/.test(effect.stat);
  const factor = additive || /(Percent|Chance|Speed)$/.test(effect.stat) ? 10 : 1;
  return `+${compactNumber(effect.min / factor)}~${compactNumber(effect.max / factor)}${percent ? '%' : ''}`;
}

export function effectTier(effect: MaterialEffect): string {
  return Array.isArray(effect.tier) ? `T${effect.tier[0]}-${effect.tier[1]}` : `T${effect.tier}`;
}

export function effectSlotLabel(slot: string): string {
  return slot === 'ALL' ? 'All slots' : titleCase(slot);
}

export function monsterStat(monster: MonsterRecord, label: string): number {
  const value = Number(monster.stats.find((stat) => stat.label === label)?.value);
  return Number.isFinite(value) ? value : 0;
}

export function monsterElement(monster: MonsterRecord): string {
  const sourceElements = monster.source.attackElements;
  if (Array.isArray(sourceElements) && typeof sourceElements[0] === 'string') return sourceElements[0];
  const attack = monster.source.attack;
  if (attack && typeof attack === 'object' && typeof (attack as Record<string, unknown>).damageType === 'string') {
    return String((attack as Record<string, unknown>).damageType);
  }
  return 'Physical';
}

export function monsterAttack(monster: MonsterRecord) {
  const raw = monster.source.attack;
  const attack = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const numeric = (key: string, fallback = 0) => {
    const value = Number(attack[key]);
    return Number.isFinite(value) ? value : fallback;
  };
  return {
    activation: titleCase(typeof attack.activation === 'string' ? attack.activation : 'BASEATTACK'),
    element: typeof attack.damageType === 'string' ? attack.damageType : monsterElement(monster),
    range: numeric('range'),
    power: numeric('value', 1000) / 10
  };
}

function isAnimation(value: unknown): value is MonsterAnimation {
  if (!value || typeof value !== 'object') return false;
  const animation = value as Record<string, unknown>;
  return typeof animation.name === 'string'
    && typeof animation.label === 'string'
    && typeof animation.sheet === 'string'
    && Number.isFinite(Number(animation.frames))
    && Number.isFinite(Number(animation.w))
    && Number.isFinite(Number(animation.h));
}

export function monsterAnimations(
  monster: MonsterRecord,
  feature: Record<string, unknown>
): MonsterAnimation[] {
  const folder = typeof monster.source.sprite_folder === 'string'
    ? monster.source.sprite_folder.split('/').filter(Boolean).at(-1)
    : null;
  const entry = folder ? feature[folder] : null;
  if (!entry || typeof entry !== 'object') return [];
  const anims = (entry as Record<string, unknown>).anims;
  if (!Array.isArray(anims)) return [];
  return anims.filter(isAnimation).map((animation) => ({
    name: animation.name,
    label: animation.label,
    sheet: animation.sheet,
    frames: Number(animation.frames),
    w: Number(animation.w),
    h: Number(animation.h)
  }));
}
