import {
  CONTENT_KINDS,
  SOURCE_GEAR_TYPES,
  SOURCE_GRADE_ORDER,
  type ContentCatalog,
  type ContentFamilyCounts,
  type ContentKind,
  type ContentRecord,
  type GearRecord,
  type StageRecord
} from './schema.ts';

export const LOCKED_CONTENT_COUNTS: Omit<ContentFamilyCounts, 'materialEffects'> & {
  materialEffects: 79;
} = {
  gear: 200,
  grade: 10,
  material: 125,
  stageBox: 59,
  stage: 120,
  monster: 61,
  skill: 106,
  passiveSkill: 108,
  rune: 197,
  buff: 29,
  statusEffect: 6,
  hero: 6,
  pet: 8,
  materialEffects: 79
};

const ALLOWED_KINDS = new Set<string>(CONTENT_KINDS);
const ALLOWED_GRADES = new Set<string>(SOURCE_GRADE_ORDER);
const ALLOWED_GEAR_TYPES = new Set<string>(SOURCE_GEAR_TYPES);
const ALLOWED_GEAR_GROUPS = new Set(['Weapon', 'Off-hand', 'Armor', 'Accessory']);
const ALLOWED_STAGE_DIFFICULTIES = new Set(['NORMAL', 'NIGHTMARE', 'HELL', 'TORMENT']);
const EXPECTED_ABSENT_GEAR_COMBINATIONS = [
  'COMMON:AMULET',
  'COMMON:BRACER',
  'COMMON:EARING',
  'COMMON:RING'
];
const PUBLIC_GAME_ASSET = /^\/game\/.+\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
const LOCALE_KEY = /^[a-z]{2}-[A-Za-z]{2,4}$/;

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function finiteAtLeast(value: unknown, minimum: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum;
}

function validateNestedSnapshot(value: unknown, errors: string[], context = 'catalog'): void {
  if (typeof value === 'string') {
    if (PUBLIC_GAME_ASSET.test(value) && !value.startsWith('/game/content/')) {
      errors.push(`${context} asset must begin with /game/content/: ${value}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateNestedSnapshot(entry, errors, `${context}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, entry] of Object.entries(value)) {
    if (LOCALE_KEY.test(key)) errors.push(`${context}.${key} contains a foreign locale key`);
    validateNestedSnapshot(entry, errors, `${context}.${key}`);
  }
}

function validateGear(record: GearRecord, context: string, errors: string[]): void {
  if (!finiteAtLeast(record.level, 1)) {
    errors.push(
      Number.isFinite(record.level)
        ? `${context} level must be at least 1: ${record.level}`
        : `${context} level is not finite: ${String(record.level)}`
    );
  }
  if (!finiteAtLeast(record.sellGold, 0)) {
    errors.push(`${context} sellGold must be a finite non-negative number: ${record.sellGold}`);
  }
  if (!finiteAtLeast(record.cubeExp, 0)) {
    errors.push(`${context} cubeExp must be a finite non-negative number: ${record.cubeExp}`);
  }
  if (!ALLOWED_GRADES.has(record.gradeId)) errors.push(`${context} has invalid grade ${record.gradeId}`);
  if (!ALLOWED_GEAR_TYPES.has(record.gearType)) {
    errors.push(`${context} has invalid gear type ${record.gearType}`);
  }
  if (!ALLOWED_GEAR_GROUPS.has(record.gearGroup)) {
    errors.push(`${context} has invalid gear group ${record.gearGroup}`);
  }
}

function validateStage(record: StageRecord, context: string, errors: string[]): void {
  for (const [label, value, minimum] of [
    ['act', record.act, 1],
    ['number', record.number, 1],
    ['level', record.level, 1],
    ['kills', record.kills, 0],
    ['goldPerClear', record.goldPerClear, 0],
    ['expPerClear', record.expPerClear, 0]
  ] as const) {
    if (!finiteAtLeast(value, minimum)) {
      errors.push(`${context} ${label} must be finite and at least ${minimum}: ${String(value)}`);
    }
  }
  if (record.waves !== null && !finiteAtLeast(record.waves, 1)) {
    errors.push(`${context} waves must be null or at least 1: ${String(record.waves)}`);
  }
  if (!ALLOWED_STAGE_DIFFICULTIES.has(record.difficulty)) {
    errors.push(`${context} has invalid difficulty ${record.difficulty}`);
  }
}

function familyCount(records: ContentRecord[], kind: ContentKind): number {
  return records.filter((record) => record.kind === kind).length;
}

export function validateCatalog(catalog: ContentCatalog): ContentCatalog {
  const errors: string[] = [];
  if (catalog.version !== 1) errors.push(`catalog version expected 1, received ${catalog.version}`);
  if (catalog.locale !== 'en-US') errors.push(`catalog locale expected en-US, received ${catalog.locale}`);
  if (catalog.siteName !== 'Task Bar Hero Wiki') {
    errors.push(`catalog site name is invalid: ${String(catalog.siteName)}`);
  }
  if (JSON.stringify(catalog.gradeOrder) !== JSON.stringify(SOURCE_GRADE_ORDER)) {
    errors.push(`grade order mismatch: ${catalog.gradeOrder.join(', ')}`);
  }
  if (JSON.stringify(catalog.gearTypeOrder) !== JSON.stringify(SOURCE_GEAR_TYPES)) {
    errors.push(`gear type order mismatch: ${catalog.gearTypeOrder.join(', ')}`);
  }

  const idKeys = new Set<string>();
  const slugKeys = new Set<string>();
  for (const record of catalog.records) {
    const kind = String(record.kind);
    const id = String(record.id);
    const context = `${kind}:${id}`;
    if (!ALLOWED_KINDS.has(kind)) errors.push(`${context} has invalid kind ${kind}`);
    if (!nonEmpty(record.id)) errors.push(`${context} id is empty`);
    if (!nonEmpty(record.slug)) errors.push(`${context} slug is empty`);
    if (!nonEmpty(record.name)) errors.push(`${context} name is empty`);
    if (!nonEmpty(record.summary)) errors.push(`${context} summary is empty`);
    if (record.kind === 'gear') validateGear(record, context, errors);
    if (record.kind === 'stage') validateStage(record, context, errors);
    if (record.image !== null && !record.image.startsWith('/game/content/')) {
      errors.push(`${context} image must begin with /game/content/: ${record.image}`);
    }
    if (!Array.isArray(record.searchTerms) || record.searchTerms.some((term) => typeof term !== 'string')) {
      errors.push(`${context} searchTerms must contain only strings`);
    }
    if (!Array.isArray(record.relations)) errors.push(`${context} relations must be an array`);

    const idKey = `${kind}:${id}`;
    if (idKeys.has(idKey)) errors.push(`duplicate kind/id ${idKey}`);
    idKeys.add(idKey);
    const slugKey = `${kind}:${String(record.slug)}`;
    if (slugKeys.has(slugKey)) errors.push(`duplicate kind/slug ${slugKey}`);
    slugKeys.add(slugKey);
  }

  for (const record of catalog.records) {
    if (!Array.isArray(record.relations)) continue;
    for (const ref of record.relations) {
      const key = `${String(ref.kind)}:${String(ref.id)}`;
      if (!ALLOWED_KINDS.has(String(ref.kind))) {
        errors.push(`${record.kind}:${record.id} relation has invalid kind ${String(ref.kind)}`);
      } else if (!idKeys.has(key)) {
        errors.push(`${record.kind}:${record.id} has unresolved relation ${key}`);
      }
    }
  }

  const countKinds = Object.keys(LOCKED_CONTENT_COUNTS).filter(
    (key) => key !== 'materialEffects'
  ) as Exclude<keyof ContentFamilyCounts, 'materialEffects'>[];
  for (const kind of countKinds) {
    const actual = familyCount(catalog.records, kind);
    const expected = LOCKED_CONTENT_COUNTS[kind];
    if (actual !== expected) errors.push(`${kind} count expected ${expected}, received ${actual}`);
    if (catalog.counts[kind] !== actual) {
      errors.push(`${kind} catalog count ${catalog.counts[kind]} does not match records ${actual}`);
    }
  }
  const materialEffects = catalog.records.filter(
    (record) => record.kind === 'material' && record.hasEffects
  ).length;
  if (materialEffects !== LOCKED_CONTENT_COUNTS.materialEffects) {
    errors.push(
      `materialEffects count expected ${LOCKED_CONTENT_COUNTS.materialEffects}, received ${materialEffects}`
    );
  }
  if (catalog.counts.materialEffects !== materialEffects) {
    errors.push(
      `materialEffects catalog count ${catalog.counts.materialEffects} does not match records ${materialEffects}`
    );
  }

  const gearCombinations = new Set(
    catalog.records
      .filter((record): record is GearRecord => record.kind === 'gear')
      .map((record) => `${record.gradeId}:${record.gearType}`)
  );
  if (gearCombinations.size !== 196) {
    errors.push(`gear matrix expected 196 available combinations, received ${gearCombinations.size}`);
  }
  if (
    JSON.stringify(catalog.features.unavailableGearCombinations) !==
    JSON.stringify(EXPECTED_ABSENT_GEAR_COMBINATIONS)
  ) {
    errors.push(
      `unavailable gear combinations changed: ${catalog.features.unavailableGearCombinations.join(', ')}`
    );
  }

  validateNestedSnapshot(catalog, errors);
  if (errors.length > 0) throw new Error(errors.join('\n'));
  return catalog;
}
