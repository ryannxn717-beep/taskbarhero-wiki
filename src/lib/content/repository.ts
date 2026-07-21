import {
  SOURCE_GRADE_ORDER,
  type ContentCatalog,
  type ContentKind,
  type ContentRecord,
  type GearGroup,
  type GearRecord,
  type GearType,
  type GradeId
} from './schema.ts';

export type GearSort =
  | 'name-asc'
  | 'name-desc'
  | 'level-asc'
  | 'level-desc'
  | 'grade-asc'
  | 'grade-desc';

export interface GearFilter {
  query: string;
  gradeIds: GradeId[];
  gearTypes: GearType[];
  gearGroups: GearGroup[];
  statTypes: string[];
  minLevel: number | null;
  maxLevel: number | null;
  obtainable: 'all' | 'yes' | 'no';
  sort: GearSort;
}

export const DEFAULT_GEAR_FILTER: Readonly<GearFilter> = Object.freeze({
  query: '',
  gradeIds: [],
  gearTypes: [],
  gearGroups: [],
  statTypes: [],
  minLevel: null,
  maxLevel: null,
  obtainable: 'all',
  sort: 'name-asc'
});

export interface ContentRepository {
  get(kind: ContentKind, idOrSlug: string): ContentRecord | null;
  list(kind: ContentKind): readonly ContentRecord[];
  related(record: ContentRecord): readonly ContentRecord[];
  filterGear(input: GearFilter): readonly GearRecord[];
}

function normalizedText(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function createContentRepository(catalog: ContentCatalog): ContentRepository {
  const byKind = new Map<ContentKind, readonly ContentRecord[]>();
  const lookup = new Map<ContentKind, Map<string, ContentRecord>>();
  const sourceOrder = new Map<ContentRecord, number>();

  catalog.records.forEach((record, index) => sourceOrder.set(record, index));
  for (const record of catalog.records) {
    const kindLookup = lookup.get(record.kind) ?? new Map<string, ContentRecord>();
    kindLookup.set(record.id, record);
    kindLookup.set(record.slug, record);
    lookup.set(record.kind, kindLookup);
  }
  for (const kind of new Set(catalog.records.map((record) => record.kind))) {
    byKind.set(
      kind,
      Object.freeze(catalog.records.filter((record) => record.kind === kind))
    );
  }

  const gradeOrder = new Map(SOURCE_GRADE_ORDER.map((grade, index) => [grade, index]));

  const get = (kind: ContentKind, idOrSlug: string): ContentRecord | null =>
    lookup.get(kind)?.get(String(idOrSlug)) ?? null;

  const list = (kind: ContentKind): readonly ContentRecord[] => byKind.get(kind) ?? Object.freeze([]);

  const related = (record: ContentRecord): readonly ContentRecord[] =>
    Object.freeze(
      record.relations
        .map((reference) => get(reference.kind, reference.id))
        .filter((entry): entry is ContentRecord => entry !== null)
    );

  const filterGear = (input: GearFilter): readonly GearRecord[] => {
    if (
      input.minLevel !== null &&
      input.maxLevel !== null &&
      input.minLevel > input.maxLevel
    ) {
      throw new Error(`minLevel ${input.minLevel} cannot exceed maxLevel ${input.maxLevel}`);
    }
    const query = normalizedText(input.query);
    const grades = new Set(input.gradeIds);
    const types = new Set(input.gearTypes);
    const groups = new Set(input.gearGroups);
    const statTypes = new Set(input.statTypes);
    const rows = (list('gear') as readonly GearRecord[]).filter((record) => {
      if (query) {
        const haystack = normalizedText(
          [record.name, record.summary, ...record.searchTerms].join(' ')
        );
        if (!haystack.includes(query)) return false;
      }
      if (grades.size > 0 && !grades.has(record.gradeId)) return false;
      if (types.size > 0 && !types.has(record.gearType)) return false;
      if (groups.size > 0 && !groups.has(record.gearGroup)) return false;
      if (
        statTypes.size > 0 &&
        !record.stats.some((stat) => statTypes.has(String(stat.value)))
      ) return false;
      if (input.minLevel !== null && record.level < input.minLevel) return false;
      if (input.maxLevel !== null && record.level > input.maxLevel) return false;
      if (input.obtainable === 'yes' && !record.obtainable) return false;
      if (input.obtainable === 'no' && record.obtainable) return false;
      return true;
    });

    const direction = input.sort.endsWith('-desc') ? -1 : 1;
    const compare = (left: GearRecord, right: GearRecord): number => {
      let value = 0;
      if (input.sort.startsWith('name-')) value = left.name.localeCompare(right.name);
      if (input.sort.startsWith('level-')) value = left.level - right.level;
      if (input.sort.startsWith('grade-')) {
        value = (gradeOrder.get(left.gradeId) ?? 999) - (gradeOrder.get(right.gradeId) ?? 999);
      }
      return value === 0
        ? (sourceOrder.get(left) ?? 0) - (sourceOrder.get(right) ?? 0)
        : value * direction;
    };
    return Object.freeze([...rows].sort(compare));
  };

  return Object.freeze({ get, list, related, filterGear });
}
