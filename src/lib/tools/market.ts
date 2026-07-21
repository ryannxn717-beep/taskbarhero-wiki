import {
  SOURCE_GRADE_ORDER,
  type GearRecord,
  type GradeId,
  type MaterialRecord
} from '$lib/content/schema';

export type MarketFamily = 'gear' | 'material';
export type MarketSort = 'volume-desc' | 'price-asc' | 'price-desc' | 'change-desc' | 'name-asc';

export interface MarketQuote {
  itemId: number;
  name: string;
  slug: string;
  href: string;
  image: string | null;
  family: MarketFamily;
  gradeId: GradeId;
  priceCents: number;
  changePercent: number;
  volume24h: number;
  spreadPercent: number;
  history: readonly number[];
  label: 'Local snapshot';
}

export interface MarketFilter {
  query: string;
  family: 'all' | MarketFamily;
  gradeId: 'all' | GradeId;
  sort: MarketSort;
  page: number;
  pageSize: number;
}

export interface MarketPage {
  rows: readonly MarketQuote[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_MARKET_FILTER: Readonly<MarketFilter> = Object.freeze({
  query: '', family: 'all', gradeId: 'all', sort: 'volume-desc', page: 1, pageSize: 12
});

function stableHash(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function itemIdOf(record: GearRecord | MaterialRecord): number {
  const itemId = Number(record.id);
  if (!Number.isSafeInteger(itemId) || itemId <= 0) {
    throw new Error(`item id must be a positive safe integer; received ${record.id}`);
  }
  return itemId;
}

function quoteFor(record: GearRecord | MaterialRecord): MarketQuote {
  const itemId = itemIdOf(record);
  const hash = stableHash(`${record.kind}:${itemId}:${record.name}`);
  const gradeIndex = SOURCE_GRADE_ORDER.indexOf(record.gradeId);
  if (gradeIndex < 0) throw new Error(`item ${itemId}: unsupported grade ${record.gradeId}`);
  const priceCents = 4 + (gradeIndex + 1) * (gradeIndex + 2) * 3 + (hash % 241);
  const changePercent = Math.round((((hash >>> 7) % 901) - 450) * 10) / 100;
  const volume24h = 250 + ((hash >>> 3) % 21_000);
  const spreadPercent = Math.round((((hash >>> 16) % 240) / 10) * 10) / 10;
  const history = Object.freeze(Array.from({ length: 8 }, (_, index) => {
    const movement = (((hash >>> (index * 3)) & 15) - 7) / 100;
    return Math.max(1, Math.round(priceCents * (1 + movement)));
  }));
  return Object.freeze({
    itemId,
    name: record.name,
    slug: record.slug,
    href: `/items/${record.slug}`,
    image: record.image,
    family: record.kind,
    gradeId: record.gradeId,
    priceCents,
    changePercent,
    volume24h,
    spreadPercent,
    history,
    label: 'Local snapshot'
  });
}

export function createLocalMarketQuotes(
  records: readonly (GearRecord | MaterialRecord)[]
): readonly MarketQuote[] {
  const seen = new Set<number>();
  const quotes = records.map((record) => {
    const itemId = itemIdOf(record);
    if (seen.has(itemId)) throw new Error(`duplicate item id ${itemId}`);
    seen.add(itemId);
    return quoteFor(record);
  });
  return Object.freeze(quotes.sort((left, right) => left.itemId - right.itemId));
}

function normalized(value: string): string {
  return value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function compareQuotes(sort: MarketSort, left: MarketQuote, right: MarketQuote): number {
  let result = 0;
  if (sort === 'volume-desc') result = right.volume24h - left.volume24h;
  if (sort === 'price-asc') result = left.priceCents - right.priceCents;
  if (sort === 'price-desc') result = right.priceCents - left.priceCents;
  if (sort === 'change-desc') result = right.changePercent - left.changePercent;
  if (sort === 'name-asc') result = left.name.localeCompare(right.name);
  return result || left.itemId - right.itemId;
}

export function filterMarketQuotes(
  quotes: readonly MarketQuote[],
  filter: MarketFilter
): MarketPage {
  if (!Number.isInteger(filter.page) || filter.page < 1) {
    throw new Error(`page must be an integer from 1; received ${filter.page}`);
  }
  if (!Number.isInteger(filter.pageSize) || filter.pageSize < 1 || filter.pageSize > 100) {
    throw new Error(`pageSize must be an integer from 1 to 100; received ${filter.pageSize}`);
  }
  const query = normalized(filter.query);
  const rows = quotes.filter((quote) => {
    if (filter.family !== 'all' && quote.family !== filter.family) return false;
    if (filter.gradeId !== 'all' && quote.gradeId !== filter.gradeId) return false;
    return !query || normalized(`${quote.name} ${quote.family} ${quote.gradeId}`).includes(query);
  }).sort((left, right) => compareQuotes(filter.sort, left, right));
  const totalPages = Math.max(1, Math.ceil(rows.length / filter.pageSize));
  const start = (filter.page - 1) * filter.pageSize;
  return Object.freeze({
    rows: Object.freeze(rows.slice(start, start + filter.pageSize)),
    total: rows.length,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages
  });
}
