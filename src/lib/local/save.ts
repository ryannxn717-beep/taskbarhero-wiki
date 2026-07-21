export const MAX_SAVE_BYTES = 256 * 1024;

export interface LocalHeroSave {
  id: string;
  level: number;
}

export interface LocalInventoryRow {
  itemId: number;
  quantity: number;
}

export interface LocalSave {
  version: 1;
  heroes: readonly LocalHeroSave[];
  inventory: readonly LocalInventoryRow[];
  cube: Readonly<{ level: number; exp: number }>;
  currencies: Readonly<{ gold: number; gems: number }>;
}

export class SaveValidationError extends Error {
  constructor(
    public readonly code: string,
    public readonly path: string,
    message: string
  ) {
    super(path === 'root' ? `${path} ${message}` : `${path}: ${message}`);
    this.name = 'SaveValidationError';
  }
}

const demoSave = {
  version: 1,
  heroes: [
    { id: 'ranger', level: 18 },
    { id: 'knight', level: 24 }
  ],
  inventory: [
    { itemId: 500001, quantity: 1 },
    { itemId: 300001, quantity: 2 }
  ],
  cube: { level: 8, exp: 2255 },
  currencies: { gold: 12500, gems: 40 }
};

export const DEMO_SAVE_TEXT = JSON.stringify(demoSave, null, 2);

const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);

function fail(code: string, path: string, message: string): never {
  throw new SaveValidationError(code, path, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function inspectKeys(value: unknown, path = 'root', seen = new WeakSet<object>()) {
  if (typeof value !== 'object' || value === null) return;
  if (seen.has(value)) return;
  seen.add(value);
  for (const key of Object.keys(value)) {
    if (unsafeKeys.has(key)) fail('unsafe_key', path, `unsafe key ${key}`);
    inspectKeys((value as Record<string, unknown>)[key], `${path}.${key}`, seen);
  }
}

function recordAt(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) fail('wrong_type', path, 'must be an object');
  return value;
}

function arrayAt(value: unknown, path: string, maxLength: number): unknown[] {
  if (!Array.isArray(value)) fail('wrong_type', path, 'must be an array');
  if (value.length > maxLength) fail('too_many_rows', path, `contains ${value.length} rows; maximum is ${maxLength}`);
  return value;
}

function integerAt(
  record: Record<string, unknown>,
  key: string,
  path: string,
  minimum: number,
  maximum: number
): number {
  const value = record[key];
  if (!Number.isSafeInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    fail('invalid_number', `${path}.${key}`, `must be an integer from ${minimum} to ${maximum}; received ${String(value)}`);
  }
  return value as number;
}

function textAt(record: Record<string, unknown>, key: string, path: string): string {
  const value = record[key];
  if (typeof value !== 'string' || !/^[a-z0-9-]{1,40}$/i.test(value)) {
    fail('invalid_text', `${path}.${key}`, `must contain 1–40 letters, numbers, or hyphens; received ${String(value)}`);
  }
  return value;
}

export function normalizeSave(value: unknown): LocalSave {
  inspectKeys(value);
  const root = recordAt(value, 'root');
  const version = integerAt(root, 'version', 'root', 1, Number.MAX_SAFE_INTEGER);
  if (version !== 1) fail('unsupported_version', 'root.version', `unsupported save version ${version}; expected 1`);

  const heroIds = new Set<string>();
  const heroes = arrayAt(root.heroes, 'root.heroes', 32).map((entry, index) => {
    const path = `root.heroes[${index}]`;
    const hero = recordAt(entry, path);
    const id = textAt(hero, 'id', path).toLowerCase();
    if (heroIds.has(id)) fail('duplicate_hero', path, `duplicate hero id ${id}`);
    heroIds.add(id);
    return Object.freeze({ id, level: integerAt(hero, 'level', path, 1, 100) });
  }).sort((left, right) => left.id.localeCompare(right.id));

  const itemIds = new Set<number>();
  const inventory = arrayAt(root.inventory, 'root.inventory', 2000).map((entry, index) => {
    const path = `root.inventory[${index}]`;
    const item = recordAt(entry, path);
    const itemId = integerAt(item, 'itemId', path, 1, 999_999_999);
    if (itemIds.has(itemId)) fail('duplicate_item', path, `duplicate itemId ${itemId}`);
    itemIds.add(itemId);
    return Object.freeze({ itemId, quantity: integerAt(item, 'quantity', path, 1, 999_999) });
  }).sort((left, right) => left.itemId - right.itemId);

  const cubeRecord = recordAt(root.cube, 'root.cube');
  const currencyRecord = recordAt(root.currencies, 'root.currencies');

  return Object.freeze({
    version: 1,
    heroes: Object.freeze(heroes),
    inventory: Object.freeze(inventory),
    cube: Object.freeze({
      level: integerAt(cubeRecord, 'level', 'root.cube', 1, 100),
      exp: integerAt(cubeRecord, 'exp', 'root.cube', 0, Number.MAX_SAFE_INTEGER)
    }),
    currencies: Object.freeze({
      gold: integerAt(currencyRecord, 'gold', 'root.currencies', 0, Number.MAX_SAFE_INTEGER),
      gems: integerAt(currencyRecord, 'gems', 'root.currencies', 0, Number.MAX_SAFE_INTEGER)
    })
  });
}

export function parseSaveText(text: string): LocalSave {
  const byteLength = new TextEncoder().encode(text).byteLength;
  if (byteLength === 0 || text.trim().length === 0) fail('empty', 'root', 'save input is empty');
  if (byteLength > MAX_SAVE_BYTES) {
    fail('too_large', 'root', `save is ${byteLength} bytes and exceeds the ${MAX_SAVE_BYTES}-byte limit`);
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail('invalid_json', 'root', `must be valid JSON (${detail})`);
  }
  return normalizeSave(value);
}
