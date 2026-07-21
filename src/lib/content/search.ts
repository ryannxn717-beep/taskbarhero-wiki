import { CONTENT_KINDS, type ContentRecord } from './schema.ts';
import type { ContentRepository } from './repository.ts';
import { hrefForRecord } from './routes.ts';

export interface MatchRange {
  start: number;
  end: number;
}

export interface SearchResult {
  record: ContentRecord;
  href: string;
  score: number;
  ranges: MatchRange[];
}

interface IndexedRecord {
  record: ContentRecord;
  href: string;
  name: string;
  nameTokens: string[];
  summary: string;
  searchTerms: string;
  relations: string;
  kind: string;
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function kindLabel(record: ContentRecord): string {
  return record.kind.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

function nameRanges(name: string, rawQuery: string): MatchRange[] {
  const directQuery = rawQuery.trim().toLowerCase();
  const index = name.toLowerCase().indexOf(directQuery);
  return index >= 0 && directQuery ? [{ start: index, end: index + directQuery.length }] : [];
}

function scoreRecord(
  entry: IndexedRecord,
  query: string
): number {
  if (entry.name === query) return 1000;
  if (entry.name.startsWith(query)) return 800;
  if (entry.nameTokens.includes(query) || entry.name.includes(` ${query}`)) return 600;
  if (entry.relations.includes(query)) return 500;
  if (entry.searchTerms.includes(query)) return 450;
  if (entry.summary.includes(query)) return 300;
  if (entry.kind.includes(query)) return 200;
  return 0;
}

export function createContentSearch(repository: ContentRepository) {
  const records = CONTENT_KINDS.flatMap((kind) => [...repository.list(kind)]);
  const index: readonly IndexedRecord[] = Object.freeze(
    records.map((record) => {
      const name = normalize(record.name);
      return {
        record,
        href: hrefForRecord(record),
        name,
        nameTokens: name.split(' '),
        summary: normalize(record.summary),
        searchTerms: normalize(record.searchTerms.join(' ')),
        relations: normalize(repository.related(record).map((related) => related.name).join(' ')),
        kind: kindLabel(record)
      };
    })
  );
  return (rawQuery: string, limit = 20): readonly SearchResult[] => {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error(`search limit must be positive: ${limit}`);
    }
    const query = normalize(rawQuery);
    if (!query) return [];

    const results = index
      .map((entry) => ({
        record: entry.record,
        href: entry.href,
        score: scoreRecord(entry, query),
        ranges: nameRanges(entry.record.name, rawQuery)
      }))
      .filter((result) => result.score > 0)
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.record.name.localeCompare(right.record.name) ||
          left.record.kind.localeCompare(right.record.kind) ||
          left.record.id.localeCompare(right.record.id)
      )
      .slice(0, limit);
    return Object.freeze(results);
  };
}
